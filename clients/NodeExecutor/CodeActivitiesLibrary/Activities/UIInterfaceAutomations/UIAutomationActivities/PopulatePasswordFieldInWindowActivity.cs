using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Security;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities
{
    [DisplayName("Populate Password Field in Window")]
    [Description("Fills a password field in a window with a secure password value using the method you choose.")]
    [ActivityMetaData(nodeImg: "/assets/UIAutomation.svg")]
    public class PopulatePasswordFieldInWindowActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("UI Element")]
        [Description("The UI element for the password field you want to fill.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [RequiredArgument]
        [DisplayName("Password to Enter")]
        [Description("The secure password value to populate the password field with.")]
        public InArgument<SecureString> PasswordToEnter { get; set; }

        [DisplayName("Fill Method")]
        [Description("Choose how to fill the password field (Type, Paste, or Set Value).")]
        [DefaultValue(PasswordFillMethodEnum.Typing)]
        public InArgument<PasswordFillMethodEnum> FillMethod { get; set; }

        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the UI element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [DisplayName("Is Password Filled Successfully")]
        [Description("Indicates whether the password was filled successfully.")]
        public OutArgument<bool> IsPasswordFilled { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var securePassword = PasswordToEnter.Get(context);
            var passwordToEnter = ConvertSecureStringToString(securePassword);
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

                    if (fillMethod == PasswordFillMethodEnum.Typing || fillMethod == PasswordFillMethodEnum.Paste)
                    {
                        // Select all and clear
                        actionableElement.Focus();
                        Thread.Sleep(50);
                        SendKeys.SendWait("^a");
                        Thread.Sleep(50);
                        SendKeys.SendWait("{DEL}");
                        Thread.Sleep(50);
                    }

                    if (fillMethod == PasswordFillMethodEnum.Typing)
                    {
                        SendKeysHelper.SendKeysTyping(passwordToEnter, 58);
                        valueEntered = true;
                        statusMessage = "Password typed into the password field successfully.";
                    }
                    else if (fillMethod == PasswordFillMethodEnum.Paste)
                    {
                        if (!string.IsNullOrEmpty(passwordToEnter))
                            Clipboard.SetText(passwordToEnter);
                        else
                            Clipboard.Clear();
                        Thread.Sleep(50);
                        SendKeys.SendWait("^v");
                        valueEntered = true;
                        statusMessage = "Password pasted into the password field successfully.";
                    }
                    else if (fillMethod == PasswordFillMethodEnum.SetValue)
                    {
                        var valuePattern = actionableElement.Patterns.Value.PatternOrDefault;
                        if (valuePattern != null)
                        {
                            valuePattern.SetValue(passwordToEnter);
                            actionableElement.Focus();
                            valueEntered = true;
                            statusMessage = "Password set in the password field successfully.";
                        }
                        else
                        {
                            statusMessage = "SetValue is not supported for this password field.";
                        }
                    }
                }
                else
                {
                    statusMessage = "Could not find the password field within the specified time.";
                }

                IsPasswordFilled.Set(context, valueEntered);
                IsSuccess.Set(context, valueEntered);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                IsPasswordFilled.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error populating password field: {ex.Message}");
            }
            finally
            {
                passwordToEnter = string.Empty;
            }
        }
    }

    public enum PasswordFillMethodEnum
    {
        [Display(Name = "Type", Description = "Type the password into the field.")]
        Typing = 1,

        [Display(Name = "Paste", Description = "Paste the password into the field.")]
        Paste = 2,

        [Display(Name = "Set Value", Description = "Set the password value directly (if supported).")]
        SetValue = 3
    }
}