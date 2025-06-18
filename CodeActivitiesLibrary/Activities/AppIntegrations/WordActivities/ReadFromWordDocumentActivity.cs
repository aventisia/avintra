using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Read from Word Document")]
    [Description("Reads the text content from a document of a Word instance.")]
    public class ReadFromWordDocumentActivity : BaseCodeActivity
    {
        [DisplayName("Word Instance")]
        [Description("The specific Word instance to read from.")]
        [RequiredArgument]
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

                Console.WriteLine("Content retrieved successfully.");
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Content retrieved successfully");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error reading from Word document:: {ex.Message}");
            }
        }
    }
    public enum RetrieveOptionEnum
    {
        [Display(Name = "Whole Document", Description = "Retrieves the entire content of the document.")]
        WholeDocument,

        [Display(Name = "Pages", Description = "Retrieves content based on specified page numbers.")]
        Pages,

        [Display(Name = "Bookmark", Description = "Retrieves content located within a specific bookmark.")]
        Bookmark
    }

}