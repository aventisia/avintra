using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities
{
    [DisplayName("Get Access Token Using App Key")]
    [Description("Acquires a Microsoft Graph API access token using client credentials (App Key flow).")]
    public class GetAccessTokenUsingAppKeyActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Tenant ID")]
        [Description("The Azure Active Directory tenant (directory) ID.")]
        public InArgument<string> TenantId { get; set; }

        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Azure AD application (client) ID.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The Azure AD application client secret.")]
        public InArgument<string> ClientSecret { get; set; }

        [DisplayName("Access Token")]
        [Description("The access token retrieved from Microsoft Graph using application permissions.")]
        public OutArgument<string> AccessToken { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string tenantId = TenantId.Get(context);
            string clientId = ClientId.Get(context);
            string clientSecret = ClientSecret.Get(context);

            try
            {
                var task = Task.Run(async () =>
                {
                    var tokenHelper = new GetAccessTokenHelper();
                    var token = await tokenHelper.GetAccessTokenAsync(tenantId, clientId, clientSecret);
                    AccessToken.Set(context, token);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Access token retrieved successfully.");
                });

                task.Wait();
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving access token: {ex.Message}");
            }
        }
    }
}
