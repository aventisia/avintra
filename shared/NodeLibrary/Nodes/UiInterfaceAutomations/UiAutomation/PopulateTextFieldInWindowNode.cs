using NodeLibrary.UiAutomationNodes.Enums;
using NodeLibrary.UiAutomationNodes.Helpers;
using FlaUI.Core.Input;
using FlaUI.Core.WindowsAPI;

namespace NodeLibrary.UiAutomationNodes;

[DisplayName("Populate Text Field in Window"), Description("Fills a text box or editable field in a window with the specified text using the method you choose.")]
[NodeMetadata(icon: "/assets/UIAutomation.svg")]
public class PopulateTextFieldInWindowNode : BaseNode
{
    [DisplayName("UI Element"), Description("The UI element for the text box or editable field you want to fill.")]
    public required InArgument<string> IdentificationObjectPath { get; set; }

    [DisplayName("Text to Enter"), Description("The text to populate the text field with.")]
    public required InArgument<string> TextToEnter { get; set; }

    [DisplayName("Fill Method"), Description("Choose how to fill the text field (Type, Paste, or Set Value).")]
    public InArgument<FillMethodEnum> FillMethod { get; set; } = new InArgument<FillMethodEnum>(FillMethodEnum.Typing);

    [DisplayName("Max Wait Time (seconds)"), Description("Maximum time to wait to find the UI element (in seconds).")]
    public InArgument<int> MaxWaitTime { get; set; } = new InArgument<int>(5);

    [DisplayName("Is Text Filled Successfully"), Description("Indicates whether the text was filled successfully.")]
    public OutArgument<bool> IsTextFilled { get; set; } = new OutArgument<bool>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var identificationObjectPath = UiAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var textToEnter = TextToEnter.Get(context);
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
                    SendKeysHelper.SendKeysTyping(textToEnter, 58);
                    valueEntered = true;
                    status = "Text typed into the text box successfully.";
                }
                else if (fillMethod == FillMethodEnum.Paste)
                {
                    SendKeysHelper.SetClipboardText(textToEnter);
                    Thread.Sleep(50);
                    Keyboard.TypeSimultaneously(VirtualKeyShort.CONTROL, VirtualKeyShort.KEY_V);
                    valueEntered = true;
                    status = "Text pasted into the text box successfully.";
                }
                else if (fillMethod == FillMethodEnum.SetValue)
                {
                    var valuePattern = actionableElement.Patterns.Value.PatternOrDefault;
                    if (valuePattern != null)
                    {
                        valuePattern.SetValue(textToEnter);
                        actionableElement.Focus();
                        valueEntered = true;
                        status = "Text set in the text box successfully.";
                    }
                    else
                    {
                        status = "SetValue is not supported for this text box.";
                    }
                }
            }
            else
            {
                status = "Could not find the text box within the specified time.";
            }

            IsTextFilled.Set(context, valueEntered);
            IsSuccess.Set(context, valueEntered);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsTextFilled.Set(context, false);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error populating text field: {ex.Message}");
        }
    }
}
