using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MessageBoxActivities
{

    // Activity to display a select from list dialog
    //[DisplayName("Display Select from List Dialog"),
    // Description("Displays a dialog box with options that lets the user select from a list.")]
    //public class DisplaySelectFromListDialogActivity : CodeActivity
    //{
    //    [RequiredArgument, Category("Input"), Description("The list of options to display.")]
    //    public InArgument<IEnumerable<string>> Options { get; set; }

    //    [RequiredArgument, Category("Input"), Description("The prompt message to display.")]
    //    public InArgument<string> Prompt { get; set; }

    //    [Category("Output"), Description("Returns the selected option or null if canceled.")]
    //    public OutArgument<string> Result { get; set; }

    //    [Category("Output"), Description("Returns the status message of the operation.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var options = Options.Get(context);
    //        var prompt = Prompt.Get(context);
    //        var result = "";
    //        var status = "";

    //        try
    //        {
    //            using (var form = new Form())
    //            {
    //                var listBox = new ListBox
    //                {
    //                    Dock = DockStyle.Top,
    //                    Items = options.ToList()
    //                };

    //                form.Controls.Add(listBox);

    //                var okButton = new Button
    //                {
    //                    Text = "OK",
    //                    Dock = DockStyle.Bottom
    //                };
    //                okButton.Click += (sender, e) =>
    //                {
    //                    result = listBox.SelectedItem?.ToString();
    //                    form.DialogResult = DialogResult.OK;
    //                };

    //                var cancelButton = new Button
    //                {
    //                    Text = "Cancel",
    //                    Dock = DockStyle.Bottom
    //                };
    //                cancelButton.Click += (sender, e) =>
    //                {
    //                    form.DialogResult = DialogResult.Cancel;
    //                };

    //                form.Controls.Add(okButton);
    //                form.Controls.Add(cancelButton);

    //                if (form.ShowDialog() == DialogResult.OK)
    //                {
    //                    status = "Option selected successfully.";
    //                }
    //                else
    //                {
    //                    result = null;
    //                    status = "User canceled the select from list dialog.";
    //                }
    //            }
    //        }
    //        catch (Exception ex)
    //        {
    //            result = null;
    //            status = $"Error displaying select from list dialog: {ex.Message}";
    //        }

    //        Result.Set(context, result);
    //        StatusMessage.Set(context, status);
    //    }
    //}

}