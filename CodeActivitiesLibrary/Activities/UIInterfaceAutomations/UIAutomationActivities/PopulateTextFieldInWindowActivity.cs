using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Populate Text Field in Window")]
    [Description("Fills a text box or editable field in a window with the specified text using the method you choose.")]
    public class PopulateTextFieldInWindowActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI element for the text box or editable field you want to fill.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [RequiredArgument]
        [DisplayName("Text to Enter")]
        [Description("The text to populate the text field with.")]
        public InArgument<string> TextToEnter { get; set; }

        [DisplayName("Fill Method")]
        [Description("Choose how to fill the text field (Type, Paste, or Set Value).")]
        [DefaultValue(FillMethodEnum.Typing)]
        public InArgument<FillMethodEnum> FillMethod { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Is Text Filled Successfully")]
        [Description("Indicates whether the text was filled successfully.")]
        public OutArgument<bool> IsTextFilled { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var textToEnter = TextToEnter.Get(context);
            var fillMethod = FillMethod.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);
            string statusMessage = "";
            bool valueEntered = false;

            try
            {
                // Get the automation element for the UI element
                var actionableElement = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                if (actionableElement != null)
                {
                    actionableElement.Focus();
                    Thread.Sleep(50);

                    if (fillMethod == FillMethodEnum.Typing || fillMethod == FillMethodEnum.Paste)
                    {
                        // Select all and clear
                        actionableElement.Focus();
                        Thread.Sleep(50);
                        SendKeys.SendWait("^a");
                        Thread.Sleep(50);
                        SendKeys.SendWait("{DEL}");
                        Thread.Sleep(50);
                    }

                    if (fillMethod == FillMethodEnum.Typing)
                    {
                        SendKeysHelper.SendKeysTyping(textToEnter, 58);
                        valueEntered = true;
                        statusMessage = "Text typed into the text box successfully.";
                    }
                    else if (fillMethod == FillMethodEnum.Paste)
                    {
                        if (!string.IsNullOrEmpty(textToEnter))
                            Clipboard.SetText(textToEnter);
                        else
                            Clipboard.Clear();
                        Thread.Sleep(50);
                        SendKeys.SendWait("^v");
                        valueEntered = true;
                        statusMessage = "Text pasted into the text box successfully.";
                    }
                    else if (fillMethod == FillMethodEnum.SetValue)
                    {
                        var valuePattern = actionableElement.Patterns.Value.PatternOrDefault;
                        if (valuePattern != null)
                        {
                            valuePattern.SetValue(textToEnter);
                            actionableElement.Focus();
                            valueEntered = true;
                            statusMessage = "Text set in the text box successfully.";
                        }
                        else
                        {
                            statusMessage = "SetValue is not supported for this text box.";
                        }
                    }
                }
                else
                {
                    statusMessage = "Could not find the text box within the specified time.";
                }

                IsTextFilled.Set(context, valueEntered);
                IsSuccess.Set(context, valueEntered);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsTextFilled.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error populating text field: {ex.Message}");
            }
        }
    }

    public enum FillMethodEnum
    {
        [Display(Name = "Type", Description = "Type the text into the field.")]
        Typing = 1,

        [Display(Name = "Paste", Description = "Paste the text into the field.")]
        Paste = 2,

        [Display(Name = "Set Value", Description = "Set the value directly (if supported).")]
        SetValue = 3
    }
}