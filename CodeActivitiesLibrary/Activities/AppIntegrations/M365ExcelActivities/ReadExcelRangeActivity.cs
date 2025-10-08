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
    [DisplayName("Read Excel Range (HTTP)")]
    [Description("Reads values from an Excel range using Microsoft Graph HTTP GET.")]
    public class ReadExcelRangeActivity : BaseCodeActivity
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
        [Description("Range to read (e.g., A1:D10)")]
        public InArgument<string> RangeAddress { get; set; }

        [DisplayName("Output JSON")]
        [Description("Outputs the range values as JSON")]
        public OutArgument<string> OutputJson { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var json = ReadRangeAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    ItemId.Get(context),
                    WorksheetName.Get(context),
                    RangeAddress.Get(context)
                ).GetAwaiter().GetResult();

                OutputJson.Set(context, json);
                StatusMessage.Set(context, $"Success: Range '{RangeAddress.Get(context)}' read.");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error to read excel range: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task<string> ReadRangeAsync(
             string tenantId, string clientId, string clientSecret,
             string driveId, string itemId, string sheetName, string rangeAddress)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{sheetName}/range(address='{rangeAddress}')";

                var response = await GraphHttpHelper.GetAsync(client, url);
                response.EnsureSuccessStatusCode();

                return await response.Content.ReadAsStringAsync();
            }
        }

    }
}
