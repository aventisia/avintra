using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Net.Http.Headers;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Add Note to Opportunity")]
    [Description("Adds a text note to a Salesforce opportunity.")]
    [ActivityMetaData(nodeImg:"/assets/Salesforce.svg")]
    public class AddNoteToOpportunityActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("The credential to connect with (JSON containing InstanceUrl, AccessToken, ApiVersion).")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Opportunity ID")]
        [Description("The ID of the opportunity to add the note to.")]
        public InArgument<string> OpportunityId { get; set; }

        [RequiredArgument]
        [DisplayName("Title")]
        [Description("The title of the note (required).")]
        public InArgument<string> Title { get; set; }

        [RequiredArgument]
        [DisplayName("Body")]
        [Description("The content of the note (required).")]
        public InArgument<string> Body { get; set; }

        [DisplayName("Options")]
        [Description("Additional properties to include in the request (e.g., file attachment).")]
        public InArgument<Dictionary<string, object>> Options { get; set; }

        [DisplayName("Note ID")]
        [Description("The ID of the created note.")]
        public OutArgument<string> NoteId { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response from Salesforce.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var credentialJson = Credential.Get(context);
                var opportunityId = OpportunityId.Get(context);
                var title = Title.Get(context);
                var body = Body.Get(context);
                var options = Options.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(credentialJson))
                    throw new ArgumentException("Credential is required.");
                if (string.IsNullOrWhiteSpace(opportunityId))
                    throw new ArgumentException("Opportunity ID is required.");
                if (string.IsNullOrWhiteSpace(title))
                    throw new ArgumentException("Title is required.");
                if (string.IsNullOrWhiteSpace(body))
                    throw new ArgumentException("Body is required.");

                // Parse credentials
                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null || string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new InvalidOperationException("Invalid or missing credentials.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");
                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Build note data
                var noteData = new Dictionary<string, object>
                {
                    { "ParentId", opportunityId },
                    { "Title", title },
                    { "Body", body }
                };

                // Add additional fields
                if (options != null)
                {
                    foreach (var kv in options)
                    {
                        noteData[kv.Key] = kv.Value;
                    }
                }

                string jsonBody = JsonConvert.SerializeObject(noteData);

                // Build endpoint: /sobjects/Note
                string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/Note";

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    var content = new StringContent(jsonBody, System.Text.Encoding.UTF8, "application/json");
                    var response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        var result = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);
                        string id = result.ContainsKey("id") ? result["id"].ToString() : null;

                        NoteId.Set(context, id);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, $"Note added to opportunity '{opportunityId}' successfully.");
                    }
                    else
                    {
                        NoteId.Set(context, null);
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to add note. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                NoteId.Set(context, null);
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error adding note: {ex.Message}");
            }
        }
    }
}