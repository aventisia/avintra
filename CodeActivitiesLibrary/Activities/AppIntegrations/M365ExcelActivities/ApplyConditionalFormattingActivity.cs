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
    [DisplayName("Apply Conditional Formatting (HTTP)")]
    [Description("Applies conditional formatting to a range of cells.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class ApplyConditionalFormattingActivity : BaseCodeActivity
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
        [DisplayName("File Path")]
        [Description("The relative path to the Excel workbook in the OneDrive or SharePoint drive (e.g., 'Reports/Dashboard.xlsx').")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("The name of the worksheet containing the range to apply conditional formatting to (e.g., 'SalesData').")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Range Address")]
        [Description("The A1-style cell range to apply conditional formatting to (e.g., 'B2:B100' or 'A1:D50').")]
        public InArgument<string> RangeAddress { get; set; }

        [RequiredArgument]
        [DisplayName("Conditional Formatting Rule (JSON)")]
        [Description("A JSON string defining the conditional formatting rule. Must follow Microsoft Graph Excel conditional formatting schema (e.g., {\"type\":\"cellIs\",\"operator\":\"greaterThan\",\"formula\":[\"100\"],\"format\":{\"fill\":{\"color\":\"#FF0000\"}}}).")]
        public InArgument<string> RuleJson { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                ApplyConditionalFormattingAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    FilePath.Get(context),
                    WorksheetName.Get(context),
                    RangeAddress.Get(context),
                    RuleJson.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Conditional formatting applied to {RangeAddress.Get(context)}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error applying conditional formatting: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task ApplyConditionalFormattingAsync(string tenantId, string clientId, string clientSecret,
     string driveId, string filePath, string worksheet, string range, string ruleJson)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = GraphHttpHelper.BuildDriveItemUrl(driveId, filePath, $"/workbook/worksheets/{worksheet}/conditionalFormats");

                // If the ruleJson is already a JSON string, we can convert it to an object for the helper
                var payload = System.Text.Json.JsonSerializer.Deserialize<object>(ruleJson);

                // Send POST request using helper
                var response = await GraphHttpHelper.PostAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
