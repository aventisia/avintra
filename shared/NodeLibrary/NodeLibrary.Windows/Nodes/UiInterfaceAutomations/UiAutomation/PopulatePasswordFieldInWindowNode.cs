using NodeLibrary.UiAutomationNodes.Enums;
using NodeLibrary.UiAutomationNodes.Helpers;
using FlaUI.Core.Input;
using FlaUI.Core.WindowsAPI;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Populate Password Field in Window"), Description("Fills a password field in a window with the specified secure password using the method you choose.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class PopulatePasswordFieldInWindowNode : BaseNode
{
    [DisplayName("UI Element"), Description("The UI element for the password field you want to fill.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Password to Enter"), Description("The secure password value to populate the password field with.")]
    public required InArgument<SecureString> PasswordToEnter { get; set; }

    [DisplayName("Fill Method"), Description("Choose how to fill the password field (Type, Paste, or Set Value).")]
    public InArgument<FillMethodEnum> FillMethod { get; set; } = new InArgument<FillMethodEnum>(FillMethodEnum.Typing);

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Is Password Filled Successfully"), Description("Indicates whether the password was filled successfully.")]
    public OutArgument<bool> IsPasswordFilled { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPathValue = IdentificationObjectPath.Get(context);
            if (string.IsNullOrWhiteSpace(identificationObjectPathValue))
                throw new ArgumentException("UI element identification path is required.");

            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(identificationObjectPathValue);
            var passwordToEnter = SecureStringHelper.ConvertSecureStringToString(PasswordToEnter.Get(context) ?? new SecureString()) ?? string.Empty;
            var fillMethod = FillMethod.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);
            bool valueEntered = false;

            var actionableElement = UiAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

            if (actionableElement != null)
            {
                actionableElement.Focus();
                Thread.Sleep(50);

                if (fillMethod == FillMethodEnum.Typing || fillMethod == FillMethodEnum.Paste)
                {
                    // Select all and clear using FlaUI keyboard
                    actionableElement.Focus();
                    Thread.Sleep(50);
                    Keyboard.TypeSimultaneously(VirtualKeyShort.CONTROL, VirtualKeyShort.KEY_A);
                    Thread.Sleep(50);
                    Keyboard.Press(VirtualKeyShort.DELETE);
                    Keyboard.Release(VirtualKeyShort.DELETE);
                    Thread.Sleep(50);
                }

                if (fillMethod == FillMethodEnum.Typing)
                {
                    SendKeysHelper.SendKeysTyping(passwordToEnter, 58);
                    valueEntered = true;
                    status = "Password typed into the password field successfully.";
                }
                else if (fillMethod == FillMethodEnum.Paste)
                {
                    SendKeysHelper.SetClipboardText(passwordToEnter);
                    Thread.Sleep(50);
                    Keyboard.TypeSimultaneously(VirtualKeyShort.CONTROL, VirtualKeyShort.KEY_V);
                    valueEntered = true;
                    status = "Password pasted into the password field successfully.";
                }
                else if (fillMethod == FillMethodEnum.SetValue)
                {
                    var valuePattern = actionableElement.Patterns.Value.PatternOrDefault;
                    if (valuePattern != null)
                    {
                        valuePattern.SetValue(passwordToEnter);
                        actionableElement.Focus();
                        valueEntered = true;
                        status = "Password set in the password field successfully.";
                    }
                    else
                    {
                        status = "SetValue is not supported for this password field.";
                    }
                }
            }
            else
            {
                status = "Could not find the password field within the specified time.";
            }

            IsPasswordFilled.Set(context, valueEntered);
            IsSuccess.Set(context, valueEntered);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsPasswordFilled.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error populating password field: {ex.Message}");
        }
    }
}
