using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("Click Download Link on Web Page")]
    [Description("Simulates clicking a download link on a web page and saves the file to the specified folder.")]
    public class ClickDownloadLinkOnWebPageActivity : CodeActivity
    {
        #region Status Output

        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var webBrowserInstanceId = WebBrowserInstance.Get(context);
                var uiElement = UiElement.Get(context);
                var destinationFolder = DestinationFolder.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(uiElement))
                    throw new ArgumentException("UI Element must be selected.");

                if (string.IsNullOrWhiteSpace(destinationFolder))
                    throw new ArgumentException("Destination Folder must be specified.");

                // Simulate downloading file
                var fileName = "downloaded_file_example.txt"; // Example filename from server
                var filePath = Path.Combine(destinationFolder, fileName);

                // Set output
                DownloadedFile.Set(context, filePath);
                

                status = $"Clicked on '{uiElement}' and saved file to '{filePath}'.";
            }
            catch (Exception ex)
            {
                status = $"Error during download: {ex.Message}";
                DownloadedFile.Set(context, false);
            }

            StatusMessage.Set(context, status);
        }

        #region Inputs

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<string> WebBrowserInstance { get; set; }

        [Browsable(false)]
        [Category("Input")]
        [DisplayName("UI Element")]
        [Description("Select the UI element (download link) on the web page to click.")]
        public InArgument<string> UiElement { get; set; }

        [Category("Input")]
        [DisplayName("Destination Folder")]
        [Description("The full path of the folder where the downloaded file will be saved.")]
        public InArgument<string> DestinationFolder { get; set; }

        #endregion

        #region Outputs

        [Category("Output")]
        [DisplayName("Downloaded File Output")]
        [Description("The file path where the downloaded file was saved.")]
        public OutArgument<string> DownloadedFile { get; set; }



        #endregion
    }
}