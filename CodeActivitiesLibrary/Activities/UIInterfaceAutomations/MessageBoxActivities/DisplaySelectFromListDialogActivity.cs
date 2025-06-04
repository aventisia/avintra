using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
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
        public InArgument<string> DialogTitle { get; set; }


        [DisplayName("Dialog Message")]
        public InArgument<string> DialogMessage { get; set; }


        [DisplayName("List to Choose From")]
        public InArgument<string> ListToChooseFrom { get; set; }


        [DisplayName("Keep Select Dialog Always On Top")]
        public InArgument<bool> KeepOnTop { get; set; }


        [DisplayName("Limit to List")]
        public InArgument<bool> LimitToList { get; set; }


        [DisplayName("Allow Empty Selection")]
        public InArgument<bool> AllowEmptySelection { get; set; }


        [DisplayName("Allow Multiple Selection")]
        public InArgument<bool> AllowMultipleSelection { get; set; }


        [DisplayName("Preselect Items Starting With '+'")]
        public InArgument<bool> PreselectItemsStartingWithPlus { get; set; }


        [DisplayName("Selected Item(s)")]
        public OutArgument<string> SelectedItem { get; set; }


        [DisplayName("Selected Index(es)")]
        public OutArgument<int[]> SelectedIndex { get; set; }


        [DisplayName("Button Pressed")]
        public OutArgument<bool> ButtonPressed { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            string title = context.GetValue(DialogTitle) ?? "Select Item";
            string message = context.GetValue(DialogMessage) ?? "Please select from the list below:";
            string listInput = context.GetValue(ListToChooseFrom) ?? "";
            bool keepOnTop = context.GetValue(KeepOnTop);
            bool allowEmpty = context.GetValue(AllowEmptySelection);
            bool allowMultiple = context.GetValue(AllowMultipleSelection);
            bool preselectPlus = context.GetValue(PreselectItemsStartingWithPlus);

            List<string> items = listInput
                .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .ToList();

            ListBox listBox = new ListBox
            {
                SelectionMode = allowMultiple ? SelectionMode.MultiExtended : SelectionMode.One,
                Dock = DockStyle.Fill
            };

            for (int i = 0; i < items.Count; i++)
            {
                string item = items[i];
                listBox.Items.Add(item);
                if (preselectPlus && allowMultiple && item.StartsWith("+"))
                {
                    listBox.SetSelected(i, true);
                }
            }

            Form form = new Form
            {
                Text = title,
                TopMost = keepOnTop,
                Width = 400,
                Height = 300,
                StartPosition = FormStartPosition.CenterScreen
            };

            Label label = new Label
            {
                Text = message,
                Dock = DockStyle.Top,
                Height = 40,
                TextAlign = System.Drawing.ContentAlignment.MiddleLeft
            };

            Button okButton = new Button
            {
                Text = "OK",
                DialogResult = DialogResult.OK,
                Dock = DockStyle.Bottom
            };

            Button cancelButton = new Button
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

            DialogResult result = form.ShowDialog();

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

                string selectedItems = string.Join(", ", listBox.SelectedItems.Cast<string>());
                int[] selectedIndexes = listBox.SelectedIndices.Cast<int>().ToArray();

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