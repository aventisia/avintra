using System;
using System.Activities;
using System.ComponentModel;
using System.Threading.Tasks;
using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities.Helpers; // <-- helper namespace

namespace CodeActivitiesLibrary.AppIntegrations.M365ExcelActivities
{
    [DisplayName("Add Table to Worksheet")]
    [Description("Adds a table to a worksheet in Excel using Microsoft Graph HTTP POST.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class AddTableActivity : BaseCodeActivity
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
        [DisplayName("Item ID")]
        [Description("Excel file Item ID")]
        public InArgument<string> ItemId { get; set; }

        [RequiredArgument]
        [DisplayName("Worksheet Name")]
        [Description("Worksheet to add table to")]
        public InArgument<string> WorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Address")]
        [Description("Range for table, e.g., 'A1:C10'")]
        public InArgument<string> Address { get; set; }

        [RequiredArgument]
        [DisplayName("Has Headers")]
        [Description("Whether table has headers")]
        public InArgument<bool> HasHeaders { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                AddTableAsync(
                    TenantId.Get(context),
                    ClientId.Get(context),
                    ClientSecret.Get(context),
                    DriveId.Get(context),
                    ItemId.Get(context),
                    WorksheetName.Get(context),
                    Address.Get(context),
                    HasHeaders.Get(context)
                ).GetAwaiter().GetResult();

                StatusMessage.Set(context, $"Success: Table added to worksheet {WorksheetName.Get(context)}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error adding table: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

        private async Task AddTableAsync(string tenantId, string clientId, string clientSecret,
            string driveId, string itemId, string worksheetName, string address, bool hasHeaders)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/worksheets/{worksheetName}/tables";

                // Prepare payload
                var payload = new
                {
                    address = address,
                    hasHeaders = hasHeaders
                };

                // Send POST request using helper
                var response = await GraphHttpHelper.PostAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }
    }
}
