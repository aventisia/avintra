using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MessageBoxActivities
{
    //[DisplayName("Display Select From List Dialog")]
    //[Description("Displays a dialog box with options that lets the user select from a list.")]
    //[ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/MessageBox.svg")]
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
                var title = DialogTitle.Get(context) ?? "Select Item";
                var message = DialogMessage.Get(context) ?? "Please select from the list below:";
                var allowMultiSelect = AllowMultipleSelection.Get(context);
                var preselectPlus = PreselectItemsStartingWithPlus.Get(context);

                object rawListInput = ListToChooseFrom.Get(context);

                if (rawListInput == null)
                {
                    throw new ArgumentException("List to choose from cannot be null.");
                }

                // Convert input to list of strings
                var items = new System.Collections.Generic.List<string>();

                switch (rawListInput)
                {
                    case string str when !string.IsNullOrWhiteSpace(str):
                        items = str
                            .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                            .Select(i => i.Trim())
                            .ToList();
                        break;

                    case System.Collections.IEnumerable collection:
                        foreach (var item in collection)
                        {
                            if (item != null)
                                items.Add(item.ToString());
                        }
                        break;

                    default:
                        throw new ArgumentException("Unsupported list format. Please pass a comma-separated string or a list of strings.");
                }

                if (!items.Any())
                {
                    throw new ArgumentException("No valid items found in the list.");
                }

                // Create ListBox
                var listBox = new ListBox
                {
                    SelectionMode = allowMultiSelect ? SelectionMode.MultiExtended : SelectionMode.One,
                    Dock = DockStyle.Fill
                };

                for (int i = 0; i < items.Count; i++)
                {
                    var item = items[i];
                    listBox.Items.Add(item);
                    if (preselectPlus && allowMultiSelect && item.StartsWith("+"))
                    {
                        listBox.SetSelected(i, true);
                    }
                }

                // Create Form
                var form = new Form
                {
                    Text = title,
                    TopMost = true,
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

                form.Controls.Add(label);
                form.Controls.Add(listBox);
                form.Controls.Add(okButton);
                form.Controls.Add(cancelButton);
                form.AcceptButton = okButton;
                form.CancelButton = cancelButton;

                var result = form.ShowDialog();

                if (result == DialogResult.OK)
                {
                    var selectedItems = string.Join(", ", listBox.SelectedItems.Cast<string>());
                    var selectedIndexArray = listBox.SelectedIndices.Cast<int>().ToArray();

                    SelectedItem.Set(context, selectedItems);
                    SelectedIndex.Set(context, selectedIndexArray);
                    ButtonPressed.Set(context, true);
                    StatusMessage.Set(context, "User clicked OK and made a selection.");
                    IsSuccess.Set(context, true);
                }
                else
                {
                    SelectedItem.Set(context, null);
                    SelectedIndex.Set(context, null);
                    ButtonPressed.Set(context, false);
                    StatusMessage.Set(context, "User canceled the dialog.");
                    IsSuccess.Set(context, true);
                }
            }
            catch (Exception ex)
            {
                SelectedItem.Set(context, null);
                SelectedIndex.Set(context, null);
                ButtonPressed.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }

    }
}