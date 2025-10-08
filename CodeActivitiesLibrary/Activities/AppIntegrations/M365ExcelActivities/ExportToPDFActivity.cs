using Azure.Identity;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Export Worksheet to PDF (HTTP)")]
    [Description("Exports an Excel worksheet to PDF.")]
    public class ExportToPDFActivity : BaseCodeActivity
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
        [Description("The relative path to the Excel workbook in the OneDrive or SharePoint drive (e.g., 'Reports/Summary.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet to export to PDF (e.g., 'Dashboard'). If omitted or invalid, the entire workbook may be exported depending on implementation.")]
        public InArgument<string> WorksheetName { get; set; }

        [DisplayName("PDF Bytes")]
        [Description("The exported PDF document as a byte array. Can be saved to a file or used in downstream processes such as email attachments.")]
        public OutArgument<byte[]> PDFBytes { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var bytes = ExportToPDFAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetName.Get(context)
                ).GetAwaiter().GetResult();

                PDFBytes.Set(context, bytes);
                StatusMessage.Set(context, $"Success: Worksheet exported to PDF");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error exporting to PDF: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task<byte[]> ExportToPDFAsync(string tenantId, string clientId, string clientSecret,
            string driveId, string filePath, string worksheet)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL for exporting worksheet to PDF
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/root:{filePath}:/workbook/worksheets/{worksheet}/content?format=pdf";

                // Send GET request using helper
                var response = await GraphHttpHelper.GetAsync(client, url);
                response.EnsureSuccessStatusCode();

                // Return PDF as byte array
                return await response.Content.ReadAsByteArrayAsync();
            }
        }

    }
}
