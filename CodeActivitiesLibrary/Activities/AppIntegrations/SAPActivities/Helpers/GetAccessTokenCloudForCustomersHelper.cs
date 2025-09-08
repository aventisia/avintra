// File: Helpers/SapC4COAuthTokenHelper.cs
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities.Helpers
{
    public class GetAccessTokenCloudForCustomersHelper 
    {
        private const string TokenUrl = "https://api.crm.ondemand.com/oauth2/v0/token";

        public string GetAccessToken(string clientId, string clientSecret, string scope)
        {
            if (string.IsNullOrWhiteSpace(clientId))
                throw new ArgumentException("Client ID is required.", nameof(clientId));
            if (string.IsNullOrWhiteSpace(clientSecret))
                throw new ArgumentException("Client Secret is required.", nameof(clientSecret));
            if (string.IsNullOrWhiteSpace(scope))
                throw new ArgumentException("Scope is required.", nameof(scope));

            using (var client = new HttpClient())
            {
                var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", credentials);

                var formData = new[]
                {
                    new KeyValuePair<string, string>("grant_type", "client_credentials"),
                    new KeyValuePair<string, string>("scope", scope)
                };

                var content = new FormUrlEncodedContent(formData);

                try
                {
                    var response = client.PostAsync(TokenUrl, content).Result;
                    if (!response.IsSuccessStatusCode)
                    {
                        var error = response.Content.ReadAsStringAsync().Result;
                        throw new Exception($"Token request failed: {error}");
                    }

                    var jsonResponse = response.Content.ReadAsStringAsync().Result;
                    dynamic tokenData = JsonConvert.DeserializeObject(jsonResponse);
                    return tokenData.access_token?.ToString();
                }
                catch (Exception ex)
                {
                    throw new Exception($"Error acquiring token: {ex.Message}", ex);
                }
            }
        }
    }
}