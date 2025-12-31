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
    [DisplayName("Get Table Names")]
    [Description("Returns all table names in the workbook.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class GetTableNamesActivity : BaseCodeActivity
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

        [DisplayName("Table Names")]
        [Description("Excel file Table Names")]
        public OutArgument<List<string>> TableNames { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var tables = GetTableNamesAsync(
                TenantId.Get(context),
                ClientId.Get(context),
                ClientSecret.Get(context),
                DriveId.Get(context),
                ItemId.Get(context)
            ).GetAwaiter().GetResult();

            TableNames.Set(context, tables);
            StatusMessage.Set(context, $"Success: {tables.Count} tables found.");
            IsSuccess.Set(context, true);
        }

        private async Task<List<string>> GetTableNamesAsync(string tenantId, string clientId, string clientSecret,
     string driveId, string itemId)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/tables";

                // Send GET request using helper
                var response = await GraphHttpHelper.GetAsync(client, url);
                response.EnsureSuccessStatusCode();

                // Parse JSON and return list of table names
                var content = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(content);

                var list = new List<string>();
                foreach (var table in doc.RootElement.GetProperty("value").EnumerateArray())
                {
                    list.Add(table.GetProperty("name").GetString());
                }
                return list;
            }
        }
    }
}
