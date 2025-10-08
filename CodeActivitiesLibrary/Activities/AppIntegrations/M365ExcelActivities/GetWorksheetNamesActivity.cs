using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Get Worksheet Names")]
    [Description("Returns all worksheet names in the workbook.")]
    public class GetWorksheetNamesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("Azure AD Tenant ID")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("Azure AD Client ID")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("Azure AD Client Secret")]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Drive ID")]
        [Description("OneDrive or SharePoint Drive ID")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("Item ID")]
        [Description("Excel file Item ID")]
        public InArgument<string> ItemId { get; set; }

        [DisplayName("Worksheet Names")]
        [Description("Excel Worksheet Names")]
        public OutArgument<List<string>> WorksheetNames { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var names = GetWorksheetNamesAsync(
                TenantId.Get(context),
                ClientId.Get(context),
                ClientSecret.Get(context),
                DriveId.Get(context),
                ItemId.Get(context)
            ).GetAwaiter().GetResult();

            WorksheetNames.Set(context, names);
            StatusMessage.Set(context, $" Success: {names.Count} worksheets found.");
            IsSuccess.Set(context, true);
        }


        private async Task<List<string>> GetWorksheetNamesAsync(string tenantId, string clientId, string clientSecret,
                string driveId, string itemId)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets";

                // Send GET request using helper
                var response = await GraphHttpHelper.GetAsync(client, url);
                response.EnsureSuccessStatusCode();

                // Parse JSON and return list of worksheet names
                var content = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(content);

                var list = new List<string>();
                foreach (var sheet in doc.RootElement.GetProperty("value").EnumerateArray())
                {
                    list.Add(sheet.GetProperty("name").GetString());
                }
                return list;
            }
        }
    }
}

