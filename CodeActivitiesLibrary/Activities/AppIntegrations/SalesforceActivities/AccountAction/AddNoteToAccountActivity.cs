using CodeActivitiesLibrary.AppIntegrations.SalesforceActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [DisplayName("Add Note to Salesforce Account")]
    [Description("Adds a note (CaseComment or custom) to a Salesforce Account via related object or custom logic.")]
    public sealed class AddNoteToAccountActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Credential to Connect With")]
        [Description("The Salesforce connection credential to use for authentication.")]
        public InArgument<string> Credential { get; set; }

        [RequiredArgument]
        [DisplayName("Account ID")]
        [Description("The Salesforce ID of the Account to add the note to (required).")]
        public InArgument<string> AccountId { get; set; }

        [RequiredArgument]
        [DisplayName("Note Text")]
        [Description("The text content of the note to add.")]
        public InArgument<string> NoteText { get; set; }

        [DisplayName("Response")]
        [Description("The raw JSON response returned by Salesforce after adding the note.")]
        public OutArgument<string> Response { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string credentialJson = Credential.Get(context);
                string accountId = AccountId.Get(context);
                string noteText = NoteText.Get(context);

                if (string.IsNullOrWhiteSpace(accountId))
                    throw new ArgumentException("Account ID is required.");

                if (string.IsNullOrWhiteSpace(noteText))
                    throw new ArgumentException("Note text is required.");

                var credentials = JsonConvert.DeserializeObject<SalesforceCredentialHelper>(credentialJson);
                if (credentials == null)
                    throw new InvalidOperationException("Invalid credential format.");

                if (string.IsNullOrWhiteSpace(credentials.InstanceUrl))
                    throw new ArgumentException("InstanceUrl is missing.");

                if (string.IsNullOrWhiteSpace(credentials.AccessToken))
                    throw new ArgumentException("AccessToken is missing.");

                if (string.IsNullOrWhiteSpace(credentials.ApiVersion))
                    credentials.ApiVersion = "57.0";

                // Example: Creating a CaseComment linked to Account (or custom object)
                // For simplicity, we assume a custom object or case-based model.
                var requestBody = new Dictionary<string, object>
            {
                { "ParentId", accountId },
                { "CommentBody", noteText }
            };

                string jsonBody = JsonConvert.SerializeObject(requestBody);

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", credentials.AccessToken);
                    httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                    string uri = $"{credentials.InstanceUrl.TrimEnd('/')}/services/data/v{credentials.ApiVersion}/sobjects/CaseComment/";
                    var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

                    HttpResponseMessage response = httpClient.PostAsync(uri, content).GetAwaiter().GetResult();
                    string responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

                    if (response.IsSuccessStatusCode)
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, true);
                        StatusMessage.Set(context, "Note added successfully.");
                    }
                    else
                    {
                        Response.Set(context, responseContent);
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Failed to add note. Status: {response.StatusCode}, Response: {responseContent}");
                    }
                }
            }
            catch (Exception ex)
            {
                Response.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error adding note: {ex.Message}");
            }
        }

    }
}
