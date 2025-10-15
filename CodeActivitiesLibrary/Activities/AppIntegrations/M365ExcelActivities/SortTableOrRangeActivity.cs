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
    [DisplayName("Sort Table or Range")]
    [Description("Applies sorting to a table or range in the workbook.")]
    [ActivityMetaData(nodeImg:"/assets/M365.svg")]
    public class SortTableOrRangeActivity : BaseCodeActivity
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
        [DisplayName("Range or Table")]
        [Description("Table name or range address to sort")]
        public InArgument<string> RangeOrTable { get; set; }

        [RequiredArgument]
        [DisplayName("Sort Field")]
        [Description("Column index or name to sort by")]
        public InArgument<string> SortField { get; set; }

        [RequiredArgument]
        [DisplayName("Sort Order")]
        [Description("Ascending or Descending")]
        public InArgument<string> SortOrder { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var tenantId = TenantId.Get(context);
            var clientId = ClientId.Get(context);
            var clientSecret = ClientSecret.Get(context);
            var driveId = DriveId.Get(context);
            var itemId = ItemId.Get(context);
            var rangeOrTable = RangeOrTable.Get(context);
            var field = SortField.Get(context);
            var order = SortOrder.Get(context);

            SortAsync(tenantId, clientId, clientSecret,
            driveId, itemId, rangeOrTable, field, order
            ).GetAwaiter().GetResult();

            StatusMessage.Set(context, $"Success: Sorted '{RangeOrTable.Get(context)}' by '{SortField.Get(context)}'.");
            IsSuccess.Set(context, true);
        }

        private async Task SortAsync(string tenantId, string clientId, string clientSecret,
      string driveId, string itemId, string rangeOrTable, string field, string order)
        {
            using (var client = await GraphHttpHelper.GetAuthenticatedClient(tenantId, clientId, clientSecret))
            {
                // Build the Graph API URL for sort
                var url = GraphHttpHelper.BuildDriveItemUrl(driveId, itemId, $"/workbook/worksheets/{rangeOrTable}/sort");

                // Prepare the payload
                var payload = new
                {
                    fields = new[]
                    {
                new
                {
                    key = field,
                    ascending = order.Equals("ascending", StringComparison.OrdinalIgnoreCase)
                }
            }
                };

                // Send POST request via helper
                var response = await GraphHttpHelper.PostAsync(client, url, payload);
                response.EnsureSuccessStatusCode();
            }
        }

    }
}
