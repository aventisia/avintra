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
    [DisplayName("Set Column Width (HTTP)")]
    [Description("Sets the width of a specific column in an Excel worksheet.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class SetColumnWidthActivity : BaseCodeActivity
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
        [Description("The name of the worksheet containing the column to adjust (e.g., 'Data').")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Column Index")]
        [Description("The 1-based index of the column to resize (e.g., 1 for column A, 2 for B, etc.).")]
        public InArgument<int> ColumnIndex { get; set; }

        [RequiredArgument]
        [DisplayName("Width")]
        [Description("The new column width in characters (e.g., 15.0). Must be a positive number.")]
        public InArgument<double> Width { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                SetColumnWidthAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetName.Get(context),
                    ColumnIndex.Get(context),
                    Width.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Column {ColumnIndex.Get(context)} width set to {Width.Get(context)}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error setting column width: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task SetColumnWidthAsync(string tenantId, string clientId, string clientSecret,
      string driveId, string filePath, string worksheet, int colIndex, double width)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build the Graph API URL for the column
                var url = GraphHttpHelper.BuildDriveItemUrl(driveId, filePath, $"/workbook/worksheets/{worksheet}/columns/{colIndex}");

                // Prepare the payload for column width
                var payload = new { columnWidth = width };

                // Send PATCH request via helper
                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }

}
