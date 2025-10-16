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
    [DisplayName("Merge Cells (HTTP)")]
    [Description("Merges a range of Excel cells.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class MergeCellsActivity : BaseCodeActivity
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
        [Description("The name of the worksheet containing the range to merge (e.g., 'Summary').")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Range Address")]
        [Description("The A1-style cell range to merge (e.g., 'A1:D1' or 'B2:E5'). The range must be rectangular and not overlap existing merged cells.")]
        public InArgument<string> RangeAddress { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                MergeCellsAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetName.Get(context),
                    RangeAddress.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Merged range {RangeAddress.Get(context)}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error merging cells: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task MergeCellsAsync(string tenantId, string clientId, string clientSecret,
             string driveId, string filePath, string worksheet, string range)
        {
            var payload = new { merge = "merge" };

            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/root:{filePath}:/workbook/worksheets/{worksheet}/range(address='{range}')";

                var response = await GraphHttpHelper.PatchAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
