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
                if (preselectPlus && allowMultiple && item.StartsWith("+")) listBox.SetSelected(i, true);
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
                    context.SetValue(StatusMessage, "Selection required but not provided.");
                    context.SetValue(ButtonPressed, false);
                    context.SetValue(SelectedItem, null);
                    context.SetValue(SelectedIndex, null);
                    return;
                }

                var selectedItems = string.Join(", ", listBox.SelectedItems.Cast<string>());
                var selectedIndexes = listBox.SelectedIndices.Cast<int>().ToArray();

                context.SetValue(ButtonPressed, true);
                context.SetValue(StatusMessage, "OK pressed.");
                context.SetValue(SelectedItem, selectedItems);
                context.SetValue(SelectedIndex, selectedIndexes);
            }
            else
            {
                context.SetValue(ButtonPressed, false);
                context.SetValue(StatusMessage, "Cancel pressed.");
                context.SetValue(SelectedItem, null);
                context.SetValue(SelectedIndex, null);
            }
        }
    }
}