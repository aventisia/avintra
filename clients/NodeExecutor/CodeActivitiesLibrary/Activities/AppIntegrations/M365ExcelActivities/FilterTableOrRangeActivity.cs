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
    [DisplayName("Filter Table or Range")]
    [Description("Applies filter conditions to a table or range in the workbook.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class FilterTableOrRangeActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("The Azure Active Directory tenant ID (GUID or domain name, e.g., contoso.onmicrosoft.com).")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Azure AD application (client) ID registered in your tenant.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The client secret (password) of the Azure AD application used for authentication.")]
        [FieldType(FieldType.Password)]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Drive ID")]
        [Description("The unique identifier of the OneDrive or SharePoint document library drive.")]
        public InArgument<string> DriveId { get; set; }

        [RequiredArgument]
        [DisplayName("Item ID")]
        [Description("The unique identifier of the Excel file within the drive.")]
        public InArgument<string> ItemId { get; set; }

        [RequiredArgument]
        [DisplayName("Table or Range")]
        [Description("The name of an Excel table (e.g., 'Table1') or a cell range address (e.g., 'A1:D100') to apply the filter on.")]
        public InArgument<string> RangeOrTable { get; set; }

        [RequiredArgument]
        [DisplayName("Filter Column")]
        [Description("The column name (for tables) or column letter/number (for ranges) to filter by (e.g., 'Department' or 'B').")]
        public InArgument<string> Column { get; set; }

        [RequiredArgument]
        [DisplayName("Filter Criteria")]
        [Description("The value or condition to filter the column by (e.g., 'Sales', '>=100', or 'John*').")]
        public InArgument<string> Criteria { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var tenantId = TenantId.Get(context);
            var clientId = ClientId.Get(context);
            var clientSecret = ClientSecret.Get(context);
            var driveId = DriveId.Get(context);
            var itemId = ItemId.Get(context);
            var rangeOrTable = RangeOrTable.Get(context);
            var column = Column.Get(context);
            var criteria = Criteria.Get(context);

            FilterAsync(
            tenantId, clientId, clientSecret,
            driveId, itemId, rangeOrTable, column, criteria
            ).GetAwaiter().GetResult();

            StatusMessage.Set(context, $"Success: Applied filter on '{RangeOrTable.Get(context)}' column '{Column.Get(context)}'.");
            IsSuccess.Set(context, true);
        }

        private async Task FilterAsync(string tenantId, string clientId, string clientSecret,
            string driveId, string itemId, string rangeOrTable, string column, string criteria)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build Graph API URL
                var url = $"https://graph.microsoft.com/v1.0/drives/{driveId}/items/{itemId}/workbook/tables/{rangeOrTable}/columns/{column}/filter";

                // Build payload
                var payload = new
                {
                    criteria = new
                    {
                        filterOn = "custom",
                        criterion1 = criteria
                    }
                };

                // Send POST request using helper
                var response = await GraphHttpHelper.PostAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
