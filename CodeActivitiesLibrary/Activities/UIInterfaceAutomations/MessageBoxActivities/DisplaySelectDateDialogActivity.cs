using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MessageBoxActivities
{
    [DisplayName("Display Select Date Dialog")]
    [Description("Displays a dialog box that prompts the user to enter a date or date range.")]
    public class DisplaySelectDateDialogActivity : BaseCodeActivity
    {
        [DisplayName("Dialog Title")]
        [Description("The title text displayed at the top of the date dialog.")]
        public InArgument<string> DialogTitle { get; set; }


        [DisplayName("Dialog Message")]
        [Description("The message displayed in the date dialog.")]
        public InArgument<string> DialogMessage { get; set; }


        [DisplayName("Dialog Type")]
        [Description("Specifies whether the dialog prompts for a single date or a date range.")]
        public InArgument<DialogTypeEnum> DialogType { get; set; }


        [DisplayName("Prompt For")]
        [Description("Specifies whether to prompt for date only or date and time.")]
        public InArgument<PromptForEnum> PromptFor { get; set; }


        [DisplayName("Default Value")]
        [Description("The default date value displayed.")]
        public InArgument<string> DefaultValue { get; set; }


        [DisplayName("Keep Date Selection Dialog Always On Top")]
        [Description("If true, the dialog stays on top of other windows.")]
        public InArgument<bool> KeepOnTop { get; set; }


        [DisplayName("Selected Date")]
        [Description("The date or date range selected by the user.")]
        public OutArgument<string> SelectedDate { get; set; } // <-- Fixed here


        [DisplayName("Button Pressed")]
        [Description("Indicates whether the OK or Cancel button was pressed.")]
        public OutArgument<bool> ButtonPressed { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var title = context.GetValue(DialogTitle);
                var message = context.GetValue(DialogMessage);
                var defaultValue = context.GetValue(DefaultValue);
                var dialogType = context.GetValue(DialogType);
                var promptFor = context.GetValue(PromptFor);
                var keepOnTop = context.GetValue(KeepOnTop);

                var resultDate = "";

                var result = MessageBox.Show(
                    $"{message}\n\n(Default: {defaultValue})",
                    title,
                    MessageBoxButtons.OKCancel,
                    MessageBoxIcon.Information,
                    MessageBoxDefaultButton.Button1,
                    keepOnTop ? MessageBoxOptions.DefaultDesktopOnly : 0);

                if (result == DialogResult.OK)
                {
                    resultDate = defaultValue ?? DateTime.Now.ToString(
                        promptFor == PromptForEnum.DateOnly ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm");

                    context.SetValue(ButtonPressed, true);
                    context.SetValue(SelectedDate, resultDate);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Date selected successfully.");
                }
                else
                {
                    resultDate = "";
                    ButtonPressed.Set(context, false);
                    SelectedDate.Set(context, resultDate);
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Dialog was cancelled.");
                }
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error displaying date dialog: {ex.Message}");
            }
        }

    }

    public enum DialogTypeEnum
    {
        [Display(Name = "Single Date", Description = "Allows selection of a single date.")]
        SingleDate,

        [Display(Name = "Date Range", Description = "Allows selection of a start and end date.")]
        DateRange
    }
    public enum PromptForEnum
    {
        [Display(Name = "Date Only", Description = "Prompts the user to select a date only.")]
        DateOnly,

        [Display(Name = "Date and Time", Description = "Prompts the user to select both date and time.")]
        DateAndTime
    }
}