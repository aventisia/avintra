using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Azure.Identity;
using CodeActivitiesLibrary.Extensions;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Create Named Range (HTTP)")]
    [Description("Creates a named range in an Excel workbook using Microsoft Graph HTTP POST.")]
    public class CreateNamedRangeActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("Azure AD Tenant ID (GUID or domain)")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("Azure AD Application (Client) ID")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("Azure AD Application Client Secret")]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Drive ID")]
        [Description("OneDrive or SharePoint Drive ID")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("Item ID")]
        [Description("Excel file Item ID in the drive")]
        public InArgument<string> ItemId { get; set; }

        [RequiredArgument]
        [DisplayName("Named Range Name")]
        [Description("The name to assign to the Excel named range")]
        public InArgument<string> Name { get; set; }

        [RequiredArgument]
        [DisplayName("Reference")]
        [Description("The Excel range reference (e.g., 'Sheet1!A1:B10')")]
        public InArgument<string> Reference { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var tenantId = TenantId.Get(context);
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var driveId = DriveId.Get(context);
                var itemId = ItemId.Get(context);
                var name = Name.Get(context);
                var reference = Reference.Get(context);

                CreateNamedRangeAsync(
                tenantId,
                clientId,
                clientSecret,
                driveId,
                itemId,
                name,
                reference
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Named range '{Name.Get(context)}' created.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error for Create Named Range: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task CreateNamedRangeAsync(
            string tenantId,
            string clientId,
            string clientSecret,
            string driveId,
            string itemId,
            string name,
            string reference)
        {
            // Get token using ClientSecretCredential
            var credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
            var token = await credential.GetTokenAsync(
                new Azure.Core.TokenRequestContext(new[] { "https://graph.microsoft.com/.default" })
            );

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token.Token);

                // JSON payload for named range
                var json = $"{{\"name\":\"{name}\",\"reference\":\"{reference}\"}}";

                var response = await client.PostAsync(
                    $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/names/add",
                    new StringContent(json, Encoding.UTF8, "application/json")
                );

                response.EnsureSuccessStatusCode();
            }
        }
    }
}
