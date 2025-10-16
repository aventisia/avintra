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
    [DisplayName("Set Cell Value (HTTP)")]
    [Description("Sets the value of a single Excel cell using Microsoft Graph HTTP PATCH.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class SetCellValueActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("The Azure AD tenant identifier (e.g., 'contoso.onmicrosoft.com' or a GUID). Used to authenticate with Microsoft 365.")]
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
        [DisplayName("Drive ID")]
        [Description("The unique ID of the OneDrive or SharePoint document library drive where the Excel file is stored.")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The relative path to the Excel file in the drive (e.g., 'Reports/Summary.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet containing the target cell (e.g., 'Sheet1').")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Cell Address")]
        [Description("The address of the cell to update, in A1-style notation (e.g., 'B5', 'Z100').")]
        public InArgument<string> CellAddress { get; set; }

        [RequiredArgument]
        [DisplayName("Cell Value")]
        [Description("The value to write into the cell. Numbers, text, or formulas (e.g., '123', 'Hello', '=SUM(A1:A10)').")]
        public InArgument<string> Value { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var tenantId = TenantId.Get(context);
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var driveId = DriveId.Get(context);
                var filePath = FilePath.Get(context);
                var worksheet = WorksheetName.Get(context);
                var cell = CellAddress.Get(context);
                var value = Value.Get(context);

                SetCellValueAsync(tenantId, clientId, clientSecret, driveId, filePath, worksheet, cell, value)
                    .GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Cell {cell} updated in {worksheet}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error updating cell: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task SetCellValueAsync(string tenantId, string clientId, string clientSecret,
    string driveId, string filePath, string worksheet, string cell, string value)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build the Graph API URL for the cell range
                var url = GraphHttpHelper.BuildDriveItemUrl(driveId, filePath, $"/workbook/worksheets/{worksheet}/range(address='{cell}')");

                // Prepare the payload for the cell value
                var payload = new { values = new string[][] { new string[] { value } } };

                // Send PATCH request via helper
                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }

}
