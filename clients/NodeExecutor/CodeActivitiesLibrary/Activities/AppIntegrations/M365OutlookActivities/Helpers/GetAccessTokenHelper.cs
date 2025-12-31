using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.M365OutlookActivities.Helpers
{
    public class GetAccessTokenHelper
    {
        // Synchronous wrapper around async method
        public async Task<string> GetAccessTokenAsync(string tenantId, string clientId, string clientSecret)
        {
            var app = ConfidentialClientApplicationBuilder
                .Create(clientId)
                .WithClientSecret(clientSecret)
                .WithAuthority(new Uri("https://login.microsoftonline.com/158a6cef-fcae-481f-9c1d-f52f6626f688"))
                .Build();

            var scopes = new[] { "https://graph.microsoft.com/.default" }; // ✅ no trailing space
            var authResult = await app.AcquireTokenForClient(scopes).ExecuteAsync();
            return authResult.AccessToken;
        }

    }
}
