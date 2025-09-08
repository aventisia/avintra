using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.Activities.AppIntegrations.SAPActivities.Helpers
{
    public class Get_AccessTokenConcurRecordHelper
    {
        private const string tokenUrl = "https://us.api.concursolutions.com/oauth2/v0/token";

        public string GetAccessToken(string clientId, string clientSecret, string scope)
        {
            const string tokenUrl = "https://us.api.concursolutions.com/oauth2/v0/token";

            var client = new HttpClient();
            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
            client.DefaultRequestHeaders.Add("Authorization", $"Basic {credentials}");

            var formData = new[]
            {
                new KeyValuePair<string, string>("grant_type", "client_credentials"),
                new KeyValuePair<string, string>("scope", scope)
            };

            var content = new FormUrlEncodedContent(formData);
            var response = client.PostAsync(tokenUrl, content).Result;

            if (!response.IsSuccessStatusCode)
            {
                var error = response.Content.ReadAsStringAsync().Result;
                throw new Exception($"Token request failed: {error}");
            }

            var jsonResponse = response.Content.ReadAsStringAsync().Result;
            dynamic tokenData = JsonConvert.DeserializeObject(jsonResponse);
            return tokenData.access_token;
        }
    }
}
