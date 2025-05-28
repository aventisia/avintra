using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MessageBoxActivities
{
    // Activity to display a select folder dialog
    [DisplayName("Display Select Folder Dialog"),
     Description("Displays the select folder dialog and prompts the user to select a folder.")]
    public class DisplaySelectFolderDialogActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The initial directory path to display in the dialog.")]
        public InArgument<string> InitialDirectory { get; set; }

        [Category("Output"), Description("Returns the path of the selected folder.")]
        public OutArgument<string> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var initialDirectory = InitialDirectory.Get(context);
            var result = "";
            var status = "";

            try
            {
                using (var folderBrowserDialog = new FolderBrowserDialog())
                {
                    folderBrowserDialog.SelectedPath = initialDirectory;

                    if (folderBrowserDialog.ShowDialog() == DialogResult.OK)
                    {
                        result = folderBrowserDialog.SelectedPath;
                        status = "Folder selected successfully.";
                    }
                    else
                    {
                        result = "";
                        status = "User canceled the select folder dialog.";
                    }
                }
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error displaying select folder dialog: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}