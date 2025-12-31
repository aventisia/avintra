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
    [DisplayName("Unmerge Cells (HTTP)")]
    [Description("Unmerges a previously merged range of Excel cells in a workbook stored in OneDrive or SharePoint.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class UnmergeCellsActivity : BaseCodeActivity
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
        [Description("The unique ID of the OneDrive or SharePoint document library drive where the file is stored.")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The relative path to the Excel file in the drive (e.g., 'Reports/Financials.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet containing the merged cells to unmerge (e.g., 'Summary').")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Range Address")]
        [Description("The address of the merged cell range to unmerge, in A1 notation (e.g., 'A1:D1'). Must exactly match a currently merged range.")]
        public InArgument<string> RangeAddress { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                UnmergeCellsAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetName.Get(context),
                    RangeAddress.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Unmerged range {RangeAddress.Get(context)}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error unmerging cells: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task UnmergeCellsAsync(string tenantId, string clientId, string clientSecret,
       string driveId, string filePath, string worksheet, string range)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build the Graph API URL for the range
                var url = GraphHttpHelper.BuildDriveItemUrl(driveId, filePath, $"/workbook/worksheets/{worksheet}/range(address='{range}')");

                // Prepare the payload
                var payload = new { merge = "none" };

                // Send PATCH request via helper
                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
