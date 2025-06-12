using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.ComponentModel;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{

    [DisplayName("Attach to Running Word")]
    [Description("Attaches to a Word document that's already open.")]
    public class AttachToRunningWordActivity : BaseCodeActivity
    {

        [DisplayName("Document Name")]
        [Description("The name of the Word document to attach to.")]
        [RequiredArgument]
        public InArgument<string> DocumentName { get; set; }

        [DisplayName("Word Instance")]
        [Description("The specific Word instance for use with later Word actions.")]
        public OutArgument<Word.Application> WordInstance { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var documentName = context.GetValue(DocumentName);

                // Get the running instance of Word
                Application wordApp = null;

                // Try to get the running instance of Word
                try
                {
                    wordApp = (Application)System.Runtime.InteropServices.Marshal.GetActiveObject("Word.Application");
                }
                catch (Exception ex)
                {
                    throw new Exception("Could not find a running instance of Word.", ex);
                }

                // Ensure Word has at least one document open
                if (wordApp.Documents.Count == 0)
                {
                    throw new InvalidOperationException("No documents are open in Word.");
                }

                // Find the specified document by name
                _Document targetDocument = null;
                foreach (_Document doc in wordApp.Documents)
                {
                    if (doc.Name.Equals(documentName, StringComparison.OrdinalIgnoreCase))
                    {
                        targetDocument = doc;
                        break;
                    }
                }

                // If the document is not found, throw an exception
                if (targetDocument == null)
                {
                    throw new ArgumentException($"Document '{documentName}' not found in the running Word instance.");
                }

                // Set the active document
                targetDocument.Activate();

                // Set the output WordInstance
                context.SetValue(WordInstance, wordApp);

                Console.WriteLine($"Attached to Word document: {documentName}");
            }
            catch (Exception ex)
            {
                throw new Exception("Error attaching to running Word:", ex);
            }
        }
    }
}
