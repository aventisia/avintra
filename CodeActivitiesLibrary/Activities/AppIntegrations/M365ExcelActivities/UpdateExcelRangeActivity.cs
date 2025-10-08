using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Update Excel Range (HTTP)")]
    [Description("Updates values in a specified Excel range using Microsoft Graph HTTP PATCH.")]
    public class UpdateExcelRangeActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("The Azure AD tenant identifier.")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Application (Client) ID of the Azure AD app registered to access Microsoft Graph.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The client secret of the Azure AD application. Ensure it has the necessary permissions (e.g., Files.ReadWrite.All).")]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Workbook ID or DriveItem ID")]
        [Description("The unique Microsoft Graph ID of the Excel workbook file in OneDrive or SharePoint.")]
        public InArgument<string> WorkbookId { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet within the workbook where the range will be updated (e.g., 'Sheet1').")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Range Address (e.g., A1:B2)")]
        [Description("The cell range address in A1-style notation (e.g., 'A1', 'C3:E10') to write data into.")]
        public InArgument<string> RangeAddress { get; set; }

        [RequiredArgument]
        [DisplayName("Values (JSON or 2D array)")]
        [Description("A JSON string representing a 2D array of values to write into the range (e.g., [[\"Apple\", 10], [\"Banana\", 20]]).")]
        public InArgument<string> ValuesJson { get; set; }

        [DisplayName("Response JSON")]
        [Description("The raw JSON response from Microsoft Graph after updating the range, useful for debugging or advanced scenarios.")]
        public OutArgument<string> ResponseJson { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string tenantId = TenantId.Get(context);
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);
            string workbookId = WorkbookId.Get(context);
            string worksheet = WorksheetName.Get(context);
            string range = RangeAddress.Get(context);
            string values = ValuesJson.Get(context);

            try
            {
                Task.Run(async () =>
                {
                    using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
                    {
                        string url = $"https://graph.microsoft.com/v1.0/me/drive/items/{workbookId}/workbook/worksheets/{worksheet}/range(address='{range}')";

                        var payload = new { values = System.Text.Json.JsonSerializer.Deserialize<object>(values) };

                        var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                        response.EnsureSuccessStatusCode();

                        string responseText = await response.Content.ReadAsStringAsync();
                        ResponseJson.Set(context, responseText);
                    }
                }).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error updating Excel range: {ex.Message}", ex);
            }
        }
    }
}
