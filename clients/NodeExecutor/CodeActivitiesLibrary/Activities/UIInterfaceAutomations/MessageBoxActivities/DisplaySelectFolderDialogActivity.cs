using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MessageBoxActivities
{
    [DisplayName("Display Select Folder Dialog")]
    [Description("Displays a folder selection dialog to let users choose a folder.")]
    [ActivityMetaData(nodeImg: "/assets/MessageBox.svg")]
    public sealed class DisplaySelectFolderDialog : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Dialog Description")]
        [Description("The description or title of the folder selection dialog window.")]
        public InArgument<string> DialogDescription { get; set; }


        [DisplayName("Initial Folder")]
        [Description("The folder path where the dialog starts. If empty, defaults to Desktop.")]
        public InArgument<string> InitialFolder { get; set; }


        [DisplayName("Keep Dialog On Top")]
        [Description("If true, keeps the dialog on top of all other windows.")]
        public InArgument<bool> KeepDialogOnTop { get; set; }


        [DisplayName("Selected Folder")]
        [Description("The full path of the folder selected by the user.")]
        public OutArgument<string> SelectedFolder { get; set; }


        [DisplayName("Button Pressed")]
        [Description("True if user clicked OK; False if Cancel was clicked or dialog closed.")]
        public OutArgument<bool> ButtonPressed { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var dialogDescription = context.GetValue(DialogDescription);
                var initialFolder = context.GetValue(InitialFolder) ??
                                    Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                var keepDialogOnTop = context.GetValue(KeepDialogOnTop);

                // Configure FolderBrowserDialog
                using (var folderBrowserDialog = new FolderBrowserDialog())
                {
                    folderBrowserDialog.Description = dialogDescription;
                    folderBrowserDialog.RootFolder = Environment.SpecialFolder.Desktop;
                    folderBrowserDialog.SelectedPath = initialFolder;
                    folderBrowserDialog.ShowNewFolderButton = true;

                    // Show the dialog
                    var result = folderBrowserDialog.ShowDialog();

                    // Set output arguments
                    if (result == DialogResult.OK)
                    {
                        var selectedFolder = folderBrowserDialog.SelectedPath;
                        context.SetValue(SelectedFolder, selectedFolder);
                        context.SetValue(ButtonPressed, true);
                        context.SetValue(StatusMessage, "Folder selected successfully.");
                    }
                    else
                    {
                        context.SetValue(SelectedFolder, string.Empty);
                        context.SetValue(ButtonPressed, false);
                        context.SetValue(StatusMessage, "Operation canceled by user.");
                    }

                    IsSuccess.Set(context, true);
                }
            }
            catch (Exception ex)
            {
                context.SetValue(SelectedFolder, string.Empty);
                context.SetValue(ButtonPressed, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error selecting folder: {ex.Message}");
            }
        }

    }
}