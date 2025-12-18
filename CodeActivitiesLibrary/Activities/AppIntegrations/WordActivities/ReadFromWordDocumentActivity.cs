using CodeActivitiesLibrary.AppIntegrations.WordActivities.Enum;
using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.Activities.Statements;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Read from Word Document")]
    [Description("Reads the text content from a document of a Word instance.")]
    [ActivityMetaData(nodeImg: "/assets/Word.svg")]
    public class ReadFromWordDocumentActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Word Instance")]
        [Description("The specific Word instance to read from.")]

        public InArgument<Word.Application> WordInstance { get; set; }

        [DisplayName("Retrieve")]
        [Description("Specifies the portion of the document to retrieve.")]
        [DefaultValue(RetrieveOptionEnum.WholeDocument)]
        public InArgument<RetrieveOptionEnum> Retrieve { get; set; }

        [DisplayName("Word Data")]
        [Description("The value of the retrieved content.")]
        public OutArgument<string> WordData { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var wordApp = context.GetValue(WordInstance);
                var retrieveOption = context.GetValue(Retrieve);

                if (wordApp == null)
                {
                    throw new ArgumentNullException(nameof(WordInstance), "WordInstance cannot be null.");
                }

                // Get the active document
                _Document activeDocument = wordApp.ActiveDocument;

                if (activeDocument == null)
                {
                    throw new InvalidOperationException("No active document found in Word.");
                }

                var content = string.Empty;

                // Perform the specified action
                switch (retrieveOption)
                {
                    case RetrieveOptionEnum.WholeDocument:
                        // Retrieve the whole document content
                        content = activeDocument.Content.Text;
                        break;

                    case RetrieveOptionEnum.Pages:
                        // Placeholder for page retrieval logic
                        throw new NotImplementedException("Page retrieval is not implemented.");

                    case RetrieveOptionEnum.Bookmark:
                        // Placeholder for bookmark retrieval logic
                        throw new NotImplementedException("Bookmark retrieval is not implemented.");

                    default:
                        throw new ArgumentException("Invalid Retrieve option.");
                }

                // Set the output WordData
                context.SetValue(WordData, content);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Read from word document successfully");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error reading from Word document: {ex.Message}");
            }
            finally
            {
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Read from word document successfully"); // Optional: update base class status
            }
        }
    }
}