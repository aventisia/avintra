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
    [DisplayName("Get Named Range Names")]
    [Description("Returns all named ranges in the workbook.")]
    public class GetNamedRangeNamesActivity : BaseCodeActivity
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

        [DisplayName("Named Ranges")]
        [Description("Excel file Named Ranges")]
        public OutArgument<List<string>> NamedRanges { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var ranges = GetNamedRangesAsync(
                TenantId.Get(context),
                ClientId.Get(context),
                ClientSecret.Get(context),
                DriveId.Get(context),
                ItemId.Get(context)
            ).GetAwaiter().GetResult();

            NamedRanges.Set(context, ranges);
            StatusMessage.Set(context, $"Success: {ranges.Count} named ranges found.");
            IsSuccess.Set(context, true);
        }

        private async Task<List<string>> GetNamedRangesAsync(string tenantId, string clientId, string clientSecret,
     string driveId, string itemId)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/names";

                // Send GET request using helper
                var response = await GraphHttpHelper.GetAsync(client, url);
                response.EnsureSuccessStatusCode();

                // Parse JSON and return list of named ranges
                var content = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(content);

                var list = new List<string>();
                foreach (var range in doc.RootElement.GetProperty("value").EnumerateArray())
                {
                    list.Add(range.GetProperty("name").GetString());
                }
                return list;
            }
        }
    }
}
