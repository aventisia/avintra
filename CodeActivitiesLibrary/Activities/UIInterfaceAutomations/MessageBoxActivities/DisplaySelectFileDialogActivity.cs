using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MessageBoxActivities
{
    [DisplayName("Display Select File Dialog")]
    [Description("Displays a file selection dialog to let users choose one or more files.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/MessageBox.svg")]
    public sealed class DisplaySelectFileDialog : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Dialog Title")]
        [Description("The title of the file selection dialog window.")]
        public InArgument<string> DialogTitle { get; set; }

        [DisplayName("Initial Folder")]
        [Description("The folder path where the dialog starts. If empty, defaults to Desktop.")]
        public InArgument<string> InitialFolder { get; set; }

        [DisplayName("File Filter")]
        [Description("Filter for file types (e.g., \"Text Files (*.txt)|*.txt\"). Defaults to All Files.")]
        public InArgument<string> FileFilter { get; set; }

        [DisplayName("Keep Dialog On Top")]
        [Description("If true, keeps the dialog on top of all other windows.")]
        public InArgument<bool> KeepFileDialogOnTop { get; set; }

        [DisplayName("Allow Multiple Selection")]
        [Description("Allows user to select multiple files if set to true.")]
        public InArgument<bool> AllowMultipleSelection { get; set; }

        [DisplayName("Check If File Exists")]
        [Description("Validates that the selected file(s) exist before returning.")]
        public InArgument<bool> CheckIfFileExists { get; set; }

        [DisplayName("Selected Files")]
        [Description("A collection of full paths for the selected files.")]
        public OutArgument<List<string>> SelectedFiles { get; set; }

        [DisplayName("Button Pressed")]
        [Description("True if user clicked OK; False if Cancel was clicked or dialog closed.")]
        public OutArgument<bool> ButtonPressed { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                string dialogTitle = context.GetValue(DialogTitle);
                string initialFolder = context.GetValue(InitialFolder) ?? Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                string fileFilter = context.GetValue(FileFilter) ?? "All Files (*.*)|*.*";
                bool keepFileDialogOnTop = context.GetValue(KeepFileDialogOnTop);
                bool allowMultipleSelection = context.GetValue(AllowMultipleSelection);
                bool checkIfFileExists = context.GetValue(CheckIfFileExists);

                // Configure OpenFileDialog
                using (OpenFileDialog openFileDialog = new OpenFileDialog())
                {
                    openFileDialog.Title = dialogTitle;
                    openFileDialog.InitialDirectory = initialFolder;
                    openFileDialog.Filter = fileFilter;
                    openFileDialog.Multiselect = allowMultipleSelection;
                    openFileDialog.CheckFileExists = checkIfFileExists;

                    // Optional: Set TopMost behavior
                    if (keepFileDialogOnTop)
                    {
                        using (Form dummyForm = new Form())
                        {
                            dummyForm.TopMost = true;
                            dummyForm.StartPosition = FormStartPosition.CenterScreen;
                            dummyForm.Show();
                            dummyForm.Hide();

                            DialogResult result = openFileDialog.ShowDialog(dummyForm);

                            SetFileDialogResult(context, openFileDialog, result);
                        }
                    }
                    else
                    {
                        DialogResult result = openFileDialog.ShowDialog();
                        SetFileDialogResult(context, openFileDialog, result);
                    }
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "File selection dialog displayed successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error selecting file(s): {ex.Message}");
            }
        }

        private void SetFileDialogResult(CodeActivityContext context, OpenFileDialog openFileDialog, DialogResult result)
        {
            if (result == DialogResult.OK)
            {
                context.SetValue(SelectedFiles, new List<string>(openFileDialog.FileNames));
                context.SetValue(ButtonPressed, true);
                StatusMessage.Set(context, "Files selected successfully.");
            }
            else
            {
                context.SetValue(SelectedFiles, new List<string>());
                context.SetValue(ButtonPressed, false);
                StatusMessage.Set(context, "Operation canceled by user.");
            }
        }
    }
}