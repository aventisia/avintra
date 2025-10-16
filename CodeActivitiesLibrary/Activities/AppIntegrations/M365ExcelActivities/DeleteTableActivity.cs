using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Delete Table (HTTP)")]
    [Description("Deletes an Excel table from a workbook.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class DeleteTableActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("Azure AD Tenant ID")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("Azure AD Application Client ID")]
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
        [Description("Excel file Item ID")]
        public InArgument<string> ItemId { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name")]
        [Description("The name of the Excel table (e.g., 'Table1', 'SalesData'). Must match an existing table in the worksheet.")]
        public InArgument<string> TableName { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                DeleteTableAsync(
                    TenantId.Get(context), ClientId.Get(context), ClientSecret.Get(context),
                    DriveId.Get(context), ItemId.Get(context), TableName.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $" Success: Table '{TableName.Get(context)}' deleted.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $" Error deleting table: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task DeleteTableAsync(string tenantId, string clientId, string clientSecret,
        string driveId, string itemId, string tableName)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/tables/{tableName}";

                // Send DELETE request using helper
                var response = await GraphHttpHelper.DeleteAsync(client, url);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
