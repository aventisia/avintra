using CodeActivitiesLibrary.Activities.AppIntegrations.SAPActivities.Helpers;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using System.Text;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Add Quick Expense with Receipt")]
    [Description("Adds a quick expense entry with a receipt file in SAP Concur.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class AddQuickExpenseWithReceiptActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Client ID")]
        [Description("The Client ID from SAP Concur App Management.")]
        public InArgument<string> ClientId { get; set; }

        [RequiredArgument]
        [DisplayName("Client Secret")]
        [Description("The Client Secret from SAP Concur App Management.")]
        [EditorBrowsable(EditorBrowsableState.Never)]
        public InArgument<string> ClientSecret { get; set; }

        [RequiredArgument]
        [DisplayName("Scope")]
        [Description("The scope required (e.g., quickexpense.write).")]
        public InArgument<string> Scope { get; set; }

        [RequiredArgument]
        [DisplayName("Amount")]
        [Description("The amount of the expense.")]
        public InArgument<decimal> Amount { get; set; }

        [RequiredArgument]
        [DisplayName("Currency")]
        [Description("Currency code (e.g., USD).")]
        public InArgument<string> Currency { get; set; }

        [RequiredArgument]
        [DisplayName("Expense Type")]
        [Description("Expense type code (e.g., MEALS).")]
        public InArgument<string> ExpenseType { get; set; }

        [RequiredArgument]
        [DisplayName("Transaction Date")]
        [Description("Date of transaction (YYYY-MM-DD).")]
        public InArgument<string> TransactionDate { get; set; }

        [RequiredArgument]
        [DisplayName("File Bytes")]
        [Description("Byte array of the receipt file.")]
        public InArgument<byte[]> FileBytes { get; set; }

        [RequiredArgument]
        [DisplayName("File Name")]
        [Description("Name of the file (e.g., receipt.jpg).")]
        public InArgument<string> FileName { get; set; }

        [DisplayName("Description")]
        [Description("Optional description of the expense.")]
        public InArgument<string> Description { get; set; }

        [DisplayName("Continue on Error")]
        [Description("If true, workflow continues even if the request fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        [DisplayName("Response")]
        [Description("Response from SAP Concur API.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Status Code")]
        [Description("HTTP status code returned by the API.")]
        public OutArgument<int> StatusCode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var clientId = ClientId.Get(context);
                var clientSecret = ClientSecret.Get(context);
                var scope = Scope.Get(context);
                var amount = Amount.Get(context);
                var currency = Currency.Get(context);
                var expenseType = ExpenseType.Get(context);
                var transactionDate = TransactionDate.Get(context);
                var fileBytes = FileBytes.Get(context);
                var fileName = FileName.Get(context);
                var description = Description.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                if (string.IsNullOrWhiteSpace(clientId))
                    throw new ArgumentException("Client ID is required.");
                if (string.IsNullOrWhiteSpace(clientSecret))
                    throw new ArgumentException("Client Secret is required.");
                if (string.IsNullOrWhiteSpace(scope))
                    throw new ArgumentException("Scope is required.");
                if (amount <= 0)
                    throw new ArgumentException("Amount must be greater than zero.");
                if (string.IsNullOrWhiteSpace(currency))
                    throw new ArgumentException("Currency is required.");
                if (string.IsNullOrWhiteSpace(expenseType))
                    throw new ArgumentException("Expense Type is required.");
                if (string.IsNullOrWhiteSpace(transactionDate))
                    throw new ArgumentException("Transaction Date is required.");
                if (fileBytes == null || fileBytes.Length == 0)
                    throw new ArgumentException("File Bytes cannot be null or empty.");
                if (string.IsNullOrWhiteSpace(fileName))
                    throw new ArgumentException("File Name is required.");

                // ✅ Use the helper class instead of embedded method
                var tokenHelper = new Get_AccessTokenConcurRecordHelper();
                string token = tokenHelper.GetAccessToken(clientId, clientSecret, scope);

                var payload = new
                {
                    Amount = amount,
                    CurrencyCode = currency,
                    ExpenseTypeCode = expenseType,
                    TransactionDate = transactionDate,
                    Description = description ?? ""
                };

                var jsonPayload = JsonConvert.SerializeObject(payload);
                var (response, statusCode) = PostQuickExpenseWithReceipt(token, jsonPayload, fileBytes, fileName);

                Response.Set(context, response);
                StatusCode.Set(context, statusCode);
                IsSuccess.Set(context, statusCode == 201);
                StatusMessage.Set(context, statusCode == 201
                    ? "Quick expense added with receipt successfully."
                    : $"Failed to add expense. Status: {statusCode}");
            }
            catch (Exception ex)
            {
                var errorMsg = $"Error adding quick expense with receipt: {ex.Message}";
                Response.Set(context, errorMsg);
                StatusCode.Set(context, 500);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, errorMsg);

                if (!ContinueOnError.Get(context))
                    throw new InvalidOperationException(errorMsg, ex);
            }
        }

        private (string response, int statusCode) PostQuickExpenseWithReceipt(string token, string jsonPayload, byte[] fileBytes, string fileName)
        {
            var apiUrl = "https://us.api.concursolutions.com/quickexpense/v4/quickexpenses";
            var client = new HttpClient();

            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}");
            client.DefaultRequestHeaders.Add("Accept", "application/json");

            var formData = new MultipartFormDataContent();
            var jsonContent = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            formData.Add(jsonContent, "quickExpense");

            var fileContent = new ByteArrayContent(fileBytes);
            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg"); // Adjust per file
            formData.Add(fileContent, "receipt", fileName);

            var response = client.PostAsync(apiUrl, formData).Result;
            var responseText = response.Content.ReadAsStringAsync().Result;
            return (responseText, (int)response.StatusCode);
        }
    }
}