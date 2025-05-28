using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MessageBoxActivities
{
    // Activity to display a select date dialog
    [DisplayName("Display Select Date Dialog"),
     Description("Displays a dialog box that prompts the user to enter a date or date range.")]
    public class DisplaySelectDateDialogActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The initial date to display in the dialog.")]
        public InArgument<DateTime?> InitialDate { get; set; }

        [Category("Output"), Description("Returns the selected date or null if canceled.")]
        public OutArgument<DateTime?> Result { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var initialDate = InitialDate.Get(context);
            DateTime? result = null;
            var status = "";

            try
            {
                using (var form = new Form())
                {
                    var dateTimePicker = new DateTimePicker
                    {
                        Value = initialDate ?? DateTime.Now,
                        Format = DateTimePickerFormat.Short
                    };

                    form.Controls.Add(dateTimePicker);
                    form.AcceptButton = new Button { Text = "OK" };
                    form.CancelButton = new Button { Text = "Cancel" };

                    if (form.ShowDialog() == DialogResult.OK)
                    {
                        result = dateTimePicker.Value;
                        status = "Date selected successfully.";
                    }
                    else
                    {
                        result = null;
                        status = "User canceled the date selection dialog.";
                    }
                }
            }
            catch (Exception ex)
            {
                result = null;
                status = $"Error displaying select date dialog: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }

}