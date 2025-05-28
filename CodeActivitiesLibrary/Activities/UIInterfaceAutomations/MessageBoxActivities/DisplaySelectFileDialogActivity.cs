using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MessageBoxActivities
{
    // Activity to display a select file dialog
    //[DisplayName("Display Select File Dialog"),
    // Description("Displays the select file dialog and prompts the user to select one or more files.")]
    //public class DisplaySelectFileDialogActivity : CodeActivity
    //{
    //    [RequiredArgument, Category("Input"), Description("The initial directory path to display in the dialog.")]
    //    public InArgument<string> InitialDirectory { get; set; }

    //    [Category("Output"), Description("Returns the paths of the selected files.")]
    //    public OutArgument<IEnumerable<string>> Result { get; set; }

    //    [Category("Output"), Description("Returns the status message of the operation.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var initialDirectory = InitialDirectory.Get(context);
    //        IEnumerable<string> result = null;
    //        var status = "";

    //        try
    //        {
    //            using (var openFileDialog = new OpenFileDialog())
    //            {
    //                openFileDialog.InitialDirectory = initialDirectory;
    //                openFileDialog.Multiselect = true;

    //                if (openFileDialog.ShowDialog() == DialogResult.OK)
    //                {
    //                    result = openFileDialog.FileNames.ToList();
    //                    status = "Files selected successfully.";
    //                }
    //                else
    //                {
    //                    result = Array.Empty<string>();
    //                    status = "User canceled the select file dialog.";
    //                }
    //            }
    //        }
    //        catch (Exception ex)
    //        {
    //            result = null;
    //            status = $"Error displaying select file dialog: {ex.Message}";
    //        }

    //        Result.Set(context, result);
    //        StatusMessage.Set(context, status);
    //    }
    //}
}