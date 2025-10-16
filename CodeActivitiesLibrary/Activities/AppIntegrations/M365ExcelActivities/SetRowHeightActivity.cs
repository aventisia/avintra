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
    [DisplayName("Set Row Height (HTTP)")]
    [Description("Sets the height of a specific row in an Excel worksheet.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class SetRowHeightActivity : BaseCodeActivity
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
        [Description("The relative path to the Excel file in the drive (e.g., 'Reports/Dashboard.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet containing the row to adjust (e.g., 'Summary').")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Row Index")]
        [Description("The 1-based index of the row to resize (e.g., 1 for the first row).")]
        public InArgument<int> RowIndex { get; set; }

        [RequiredArgument]
        [DisplayName("Height")]
        [Description("The new row height in points (e.g., 20.0). Must be a positive number.")]
        public InArgument<double> Height { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                SetRowHeightAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetName.Get(context),
                    RowIndex.Get(context),
                    Height.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Row {RowIndex.Get(context)} height set to {Height.Get(context)}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error setting row height: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task SetRowHeightAsync(string tenantId, string clientId, string clientSecret,
     string driveId, string filePath, string worksheet, int rowIndex, double height)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build the Graph API URL for the row
                var url = GraphHttpHelper.BuildDriveItemUrl(driveId, filePath, $"/workbook/worksheets/{worksheet}/rows/{rowIndex}");

                // Prepare the payload for row height
                var payload = new { rowHeight = height };

                // Send PATCH request via helper
                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
