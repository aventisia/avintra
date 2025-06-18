using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MessageBoxActivities
{
    [DisplayName("Display Select From List Dialog")]
    [Description("Displays a dialog box with options that lets the user select from a list.")]
    public class DisplaySelectFromListDialogActivity : BaseCodeActivity
    {


        [DisplayName("Dialog Title")]
        [Description("The title text displayed at the top of the dialog window.")]
        public InArgument<string> DialogTitle { get; set; }

        [DisplayName("Dialog Message")]
        [Description("The message or prompt shown inside the dialog to guide the user.")]
        public InArgument<string> DialogMessage { get; set; }

        [DisplayName("List to Choose From")]
        [Description("A list of items from which the user can select one or more options.")]
        public InArgument<string> ListToChooseFrom { get; set; }

        [DisplayName("Keep Select Dialog Always On Top")]
        [Description("If true, keeps the dialog window always on top of other windows.")]
        public InArgument<bool> KeepOnTop { get; set; }

        [DisplayName("Limit to List")]
        [Description("If true, limits user input to only the items in the provided list.")]
        public InArgument<bool> LimitToList { get; set; }

        [DisplayName("Allow Empty Selection")]
        [Description("If true, allows the user to make no selection (optional choice).")]
        public InArgument<bool> AllowEmptySelection { get; set; }

        [DisplayName("Allow Multiple Selection")]
        [Description("If true, allows the user to select multiple items from the list.")]
        public InArgument<bool> AllowMultipleSelection { get; set; }

        [DisplayName("Preselect Items Starting With '+'")]
        [Description("If true, preselects all items in the list that start with a '+' character.")]
        public InArgument<bool> PreselectItemsStartingWithPlus { get; set; }

        [DisplayName("Selected Item(s)")]
        [Description("Returns the selected item(s) from the dialog as a string. For multiple selections, items are separated by commas.")]
        public OutArgument<string> SelectedItem { get; set; }

        [DisplayName("Selected Index(es)")]
        [Description("Returns the index or indices of the selected item(s) in the list.")]
        public OutArgument<int[]> SelectedIndex { get; set; }

        [DisplayName("Button Pressed")]
        [Description("Returns true if the user pressed the OK button; false if Cancel or closed the dialog.")]
        public OutArgument<bool> ButtonPressed { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var title = context.GetValue(DialogTitle) ?? "Select Item";
                var message = context.GetValue(DialogMessage) ?? "Please select from the list below:";
                var listInput = context.GetValue(ListToChooseFrom) ?? "";
                var keepOnTop = context.GetValue(KeepOnTop);
                var allowEmpty = context.GetValue(AllowEmptySelection);
                var allowMultiple = context.GetValue(AllowMultipleSelection);
                var preselectPlus = context.GetValue(PreselectItemsStartingWithPlus);

                var items = listInput
                    .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .ToList();

                var listBox = new ListBox
                {
                    SelectionMode = allowMultiple ? SelectionMode.MultiExtended : SelectionMode.One,
                    Dock = DockStyle.Fill
                };

                for (var i = 0; i < items.Count; i++)
                {
                    var item = items[i];
                    listBox.Items.Add(item);
                    if (preselectPlus && allowMultiple && item.StartsWith("+"))
                    {
                        listBox.SetSelected(i, true);
                    }
                }

                var form = new Form
                {
                    Text = title,
                    TopMost = keepOnTop,
                    Width = 400,
                    Height = 300,
                    StartPosition = FormStartPosition.CenterScreen
                };

                var label = new Label
                {
                    Text = message,
                    Dock = DockStyle.Top,
                    Height = 40,
                    TextAlign = System.Drawing.ContentAlignment.MiddleLeft
                };

                var okButton = new Button
                {
                    Text = "OK",
                    DialogResult = DialogResult.OK,
                    Dock = DockStyle.Bottom
                };

                var cancelButton = new Button
                {
                    Text = "Cancel",
                    DialogResult = DialogResult.Cancel,
                    Dock = DockStyle.Bottom
                };

                form.Controls.Add(listBox);
                form.Controls.Add(label);
                form.Controls.Add(okButton);
                form.Controls.Add(cancelButton);
                form.AcceptButton = okButton;
                form.CancelButton = cancelButton;

                var result = form.ShowDialog();

                if (result == DialogResult.OK)
                {
                    if (listBox.SelectedIndices.Count == 0 && !allowEmpty)
                    {
                        StatusMessage.Set(context, "Selection required but not provided.");
                        ButtonPressed.Set(context, false);
                        SelectedItem.Set(context, null);
                        SelectedIndex.Set(context, null);
                        IsSuccess.Set(context, false);
                        return;
                    }

                    var selectedItems = string.Join(", ", listBox.SelectedItems.Cast<string>());
                    var selectedIndexes = listBox.SelectedIndices.Cast<int>().ToArray();

                    ButtonPressed.Set(context, true);
                    StatusMessage.Set(context, "OK pressed.");
                    SelectedItem.Set(context, selectedItems);
                    SelectedIndex.Set(context, selectedIndexes);
                    IsSuccess.Set(context, true);
                }
                else
                {
                    ButtonPressed.Set(context, false);
                    StatusMessage.Set(context, "Cancel pressed.");
                    SelectedItem.Set(context, null);
                    SelectedIndex.Set(context, null);
                    IsSuccess.Set(context, true);
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Selection dialog completed successfully.");
            }
            catch (Exception ex)
            {
                ButtonPressed.Set(context, false);
                SelectedItem.Set(context, null);
                SelectedIndex.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error in selection dialog: {ex.Message}");
            }
        }

    }
}