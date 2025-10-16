using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Get Cell Value (HTTP)")]
    [Description("Reads the value of a single Excel cell using Microsoft Graph HTTP GET.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class GetCellValueActivity : BaseCodeActivity
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
        [DisplayName("File Path")]
        [Description("The relative path to the Excel file in the OneDrive or SharePoint drive (e.g., 'Reports/Data.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet containing the cell to read (e.g., 'Sheet1').")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Cell Address")]
        [Description("The address of the cell to read, in A1-style notation (e.g., 'B5', 'Z100').")]
        public InArgument<string> CellAddress { get; set; }

        [DisplayName("Cell Value")]
        [Description("The value retrieved from the specified cell. Returns text representation of the cell's content (including numbers, text, or formula results).")]
        public OutArgument<string> CellValue { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var value = GetCellValueAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetName.Get(context),
                    CellAddress.Get(context)
                ).GetAwaiter().GetResult();

                CellValue.Set(context, value);
                StatusMessage.Set(context, $"Success: Read value '{value}' from {CellAddress.Get(context)}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error reading cell: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task<string> GetCellValueAsync(string tenantId, string clientId, string clientSecret,
      string driveId, string filePath, string worksheet, string cell)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/root:{filePath}:/workbook/worksheets/{worksheet}/range(address='{cell}')";

                // Send GET request using helper
                var response = await GraphHttpHelper.GetAsync(client, url);
                response.EnsureSuccessStatusCode();

                // Parse JSON and return the cell value
                var json = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(json);
                return doc.RootElement.GetProperty("values")[0][0].GetString();
            }
        }
    }
}
