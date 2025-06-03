using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Automation;
using System.Windows.Forms;
using System.ComponentModel.DataAnnotations;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    public enum FillMethodEnum
    {
        [Display(Name = "Type", Description = "Type the text into the field.")]
        Typing = 1,

        [Display(Name = "Paste", Description = "Paste the text into the field.")]
        Paste = 2,

        [Display(Name = "Set Value", Description = "Set the value directly (if supported).")]
        SetValue = 3
    }

    [DisplayName("Populate Text Field in Window")]
    [Description("Fills a text box in a window with the specified text using the method you choose.")]
    public class PopulateTextFieldInWindowActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Parent Window")]
        [Description("Select the window or parent element where the text box is located.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Property Type")]
        [Description("Choose how you want to search for the text box (by Name, ID, Class Name, or Control Type).")]
        [DefaultValue(PropertyTypeEnum.Name)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Property Value")]
        [Description("Enter the value to search for (for example, the text box's name or ID).")]
        public InArgument<string> PropertyValue { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Text to Enter")]
        [Description("The text to populate the text field with.")]
        public InArgument<string> TextToEnter { get; set; }

        [Category("Input")]
        [DisplayName("Fill Method")]
        [Description("Choose how to fill the text field (Type, Paste, or Set Value).")]
        [DefaultValue(FillMethodEnum.Typing)]
        public InArgument<FillMethodEnum> FillMethod { get; set; }

        [Category("Input")]
        [DisplayName("Max Wait Time (seconds)")]
        [Description("How many seconds to wait while searching for the text box.")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        

        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);
            var textToEnter = TextToEnter.Get(context);
            var fillMethod = FillMethod.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);

            string status = "";
            bool valueEntered = false;

            try
            {
                for (int i = 0; i <= (maxWaitTime * 5); i++)
                {
                    try
                    {
                        var actionableElement = UIAutomationElementHelper.GetElementWithWait(
                            parentElement,
                            UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue),
                            1);

                        if (actionableElement != null)
                        {
                            if (fillMethod == FillMethodEnum.Typing || fillMethod == FillMethodEnum.Paste)
                            {
                                actionableElement.SetFocus();
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
                                status = "Text typed into the text box successfully.";
                                break;
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
                                status = "Text pasted into the text box successfully.";
                                break;
                            }
                            else if (fillMethod == FillMethodEnum.SetValue)
                            {
                                var valuePattern = actionableElement.GetCurrentPattern(ValuePattern.Pattern) as ValuePattern;
                                if (valuePattern != null)
                                {
                                    valuePattern.SetValue(textToEnter);
                                    actionableElement.SetFocus();
                                    valueEntered = true;
                                    status = "Text set in the text box successfully.";
                                    break;
                                }
                                else
                                {
                                    status = "SetValue is not supported for this text box.";
                                }
                            }
                        }
                        else
                        {
                            Thread.Sleep(500);
                        }
                    }
                    catch
                    {
                        Thread.Sleep(500);
                    }
                }

                if (!valueEntered && string.IsNullOrEmpty(status))
                {
                    status = "Could not fill the text box within the specified time.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error populating text field: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}