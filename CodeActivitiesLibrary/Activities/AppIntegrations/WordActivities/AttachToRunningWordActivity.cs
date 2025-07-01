using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using System.Runtime.InteropServices;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{

    [DisplayName("Attach to Running Word")]
    [Description("Attaches to a Word document that's already open.")]
    public class AttachToRunningWordActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Document Name")]
        [Description("The name or full path of the Word document to attach to.")]
        public InArgument<string> DocumentName { get; set; }

        [DisplayName("Word Instance")]
        [Description("The specific Word instance for use with later Word actions.")]
        public OutArgument<Word.Application> WordInstance { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            Word.Application wordApp = null;
            _Document targetDocument = null;

            try
            {
                // Retrieve input values
                var documentName = DocumentName.Get(context);

                if (string.IsNullOrWhiteSpace(documentName))
                    throw new ArgumentException("Document Name cannot be null or empty.");

                // Try to get the running instance of Word
                try
                {
                    wordApp = (Word.Application)Marshal.GetActiveObject("Word.Application");
                }
                catch (Exception ex)
                {
                    throw new Exception("Could not find a running instance of Word.", ex);
                }

                // Ensure Word has at least one document open
                if (wordApp.Documents.Count == 0)
                    throw new InvalidOperationException("No documents are open in Word.");

                // Find the specified document by name or full path
                targetDocument = wordApp.Documents.Cast<_Document>()
                    .FirstOrDefault(doc => doc.Name.Equals(documentName, StringComparison.OrdinalIgnoreCase) ||
                                           doc.FullName.Equals(documentName, StringComparison.OrdinalIgnoreCase));

                // If the document is not found, throw an exception
                if (targetDocument == null)
                    throw new ArgumentException($"Document '{documentName}' not found in the running Word instance.");

                // Set the active document
                targetDocument.Activate();

                // Set the output WordInstance
                WordInstance.Set(context, wordApp);

                StatusMessage.Set(context, $"Attached to Word document: {documentName}");
                IsSuccess.Set(context, true);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error attaching to running Word: {ex.Message}");
                IsSuccess.Set(context, false);
            }
            finally
            {
                // Release COM objects to avoid memory leaks
                if (targetDocument != null) Marshal.ReleaseComObject(targetDocument);
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
        }
    }
}
