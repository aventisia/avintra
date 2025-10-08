using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Write Excel Range (HTTP)")]
    [Description("Writes values to an Excel range using Microsoft Graph HTTP PATCH.")]
    public class WriteExcelRangeActivity : BaseCodeActivity
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
        [DisplayName("Worksheet Name")]
        [Description("Name of the worksheet")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Range Address")]
        [Description("Range to write (e.g., A1:D10)")]
        public InArgument<string> RangeAddress { get; set; }

        [RequiredArgument]
        [DisplayName("Values JSON")]
        [Description("Values to write as JSON array")]
        public InArgument<string> ValuesJson { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Extract arguments into local variables
                var tenantId = TenantId.Get(context);
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var driveId = DriveId.Get(context);
                var itemId = ItemId.Get(context);
                var worksheetName = WorksheetName.Get(context);
                var rangeAddress = RangeAddress.Get(context);
                var valuesJson = ValuesJson.Get(context);

                // Call async writer
                WriteRangeAsync(
                    tenantId,
                    clientId,
                    clientSecret,
                    driveId,
                    itemId,
                    worksheetName,
                    rangeAddress,
                    valuesJson
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $" Success: Wrote to Excel range '{rangeAddress}'.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $" Error to Write Excel range: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task WriteRangeAsync(
            string tenantId, string clientId, string clientSecret,
            string driveId, string itemId, string sheetName, string rangeAddress, string valuesJson)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build the Graph API URL for the specified range
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{sheetName}/range(address='{rangeAddress}')";

                // Prepare the payload
                var payload = new { values = System.Text.Json.JsonSerializer.Deserialize<object>(valuesJson) };

                // Send PATCH request via helper
                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
