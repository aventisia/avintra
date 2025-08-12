using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Word;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Xml.Linq;
using Word = Microsoft.Office.Interop.Word;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities
{
    [DisplayName("Attach to Running Word")]
    [Description("Attaches to a Word document that's already open, or opens it if needed.")]
    [ActivityMetaData(nodeImg: "/assets/Word.svg")]
    public class AttachToRunningWordActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Document Path")]
        [Description("The full path or file name of the Word document to attach to.")]
        public InArgument<string> DocumentPath { get; set; }

        [DisplayName("Word Instance")]
        [Description("The Word instance for later Word activities.")]
        public OutArgument<Word.Application> WordInstance { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string documentPath = DocumentPath.Get(context);
            Application wordApp = null;
            _Document targetDocument = null;

            try
            {
                if (string.IsNullOrWhiteSpace(documentPath))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Document Path cannot be null or empty.");
                    WordInstance.Set(context, null);
                    return;
                }

                // normalize to full path
                string fullPath = documentPath;
                if (!Path.IsPathRooted(documentPath) && File.Exists(documentPath))
                {
                    fullPath = Path.GetFullPath(documentPath);
                }

                // get running Word
                try
                {
                    wordApp = (Application)Marshal.GetActiveObject("Word.Application");
                }
                catch
                {
                    // no running Word found, will create one
                }

                bool isNewInstance = false;
                if (wordApp == null)
                {
                    wordApp = new Application();
                    isNewInstance = true;
                }

                // check if document is already open
                targetDocument = wordApp.Documents
                    .Cast<_Document>()
                    .FirstOrDefault(doc =>
                        doc.FullName.Equals(fullPath, StringComparison.OrdinalIgnoreCase));

                if (targetDocument == null)
                {
                    if (File.Exists(fullPath))
                    {
                        targetDocument = wordApp.Documents.Open(fullPath);
                    }
                    else
                    {
                        IsSuccess.Set(context, false);
                        StatusMessage.Set(context, $"Document does not exist at path: {fullPath}");
                        WordInstance.Set(context, null);

                        if (isNewInstance)
                        {
                            wordApp.Quit();
                        }
                        return;
                    }
                }

                targetDocument.Activate();

                WordInstance.Set(context, wordApp);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully attached to document: {fullPath}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error attaching to Word document: {ex.Message}");

                if (wordApp != null && !IsWordVisible(wordApp))
                {
                    wordApp.Quit();
                }

                WordInstance.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error attaching to Word document: {ex.Message}");
            }
        }

        private static bool IsWordVisible(Application wordApp)
        {
            try
            {
                return wordApp.Visible;
            }
            catch
            {
                return false;
            }
        }
    }
}
