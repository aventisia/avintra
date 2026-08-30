using NodeLibrary.BrowserAutomationNodes.Enums;
using NodeLibrary.BrowserAutomationNodes.Helpers;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace NodeLibrary.BrowserAutomationNodes;

[DisplayName("Set Drop-Down List Value on Web Page"), Description("Sets or clears the value of a drop-down list element on a web page.")]
[NodeMetadata(icon: "/assets/BrowserAutomation.svg")]
public class SetDropDownListValueOnWebPageNode : BaseNode
{
    [DisplayName("Web Browser Instance"), Description("Enter or choose the variable that contains the web browser instance to work with.")]
    public required InArgument<IWebDriver> WebBrowserInstance { get; set; }

    [DisplayName("Find Type"), Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
    public InArgument<ElementSelectorTypeEnum> FindType { get; set; } = new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

    [DisplayName("Search Keywords"), Description("The value used to locate the drop-down list (e.g., 'country', '//select[@id=country]').")]
    public required InArgument<string> ValueToFind { get; set; }

    [DisplayName("Operation"), Description("Specifies whether to select by name, index, or clear selection.")]
    public InArgument<DropDownListOperationEnum> Operation { get; set; } = new InArgument<DropDownListOperationEnum>(DropDownListOperationEnum.SelectOptionsByName);

    [DisplayName("Option Names"), Description("Comma-separated option names to select. Only first is used if not multi-select.")]
    public InArgument<string> OptionNames { get; set; } = new InArgument<string>("");

    [DisplayName("Use Regular Expressions"), Description("If true, matches option names using regular expressions.")]
    public InArgument<bool> UseRegularExpressions { get; set; } = new InArgument<bool>(false);

    [DisplayName("Option Indices"), Description("Comma-separated indices of options to select.")]
    public InArgument<string> OptionIndices { get; set; } = new InArgument<string>("");

    [DisplayName("Wait for Page Load"), Description("If true, waits for the page to load after setting the dropdown value.")]
    public InArgument<bool> WaitForPageLoad { get; set; } = new InArgument<bool>(true);

    [DisplayName("Timeout for Page Load"), Description("Maximum time in seconds to wait for the page to load.")]
    public InArgument<int> TimeoutForPageLoad { get; set; } = new InArgument<int>(60);

    [DisplayName("Handle Dialog"), Description("Specifies what to do if a dialog appears after setting the dropdown value.")]
    public InArgument<DialogActionEnum> IfDialogAppears { get; set; } = new InArgument<DialogActionEnum>(DialogActionEnum.DoNothing);

    [DisplayName("Dialog Button to Press"), Description("The button to press if a dialog appears (e.g., 'Ok', 'Cancel').")]
    public InArgument<string> DialogButtonToPress { get; set; } = new InArgument<string>("Ok");

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var driver = WebBrowserInstance.Get(context);
            var findType = FindType.Get(context);
            var searchKeywords = ValueToFind.Get(context);
            var operation = Operation.Get(context);
            var optionNames = OptionNames.Get(context);
            var useRegex = UseRegularExpressions.Get(context);
            var optionIndices = OptionIndices.Get(context);
            var waitForPage = WaitForPageLoad.Get(context);
            var timeout = TimeSpan.FromSeconds(TimeoutForPageLoad.Get(context));
            var dialogAction = IfDialogAppears.Get(context);
            var dialogButton = DialogButtonToPress.Get(context);

            if (driver == null)
                throw new ArgumentException("Web browser instance cannot be null.");

            if (string.IsNullOrWhiteSpace(searchKeywords))
                throw new ArgumentException("Search keywords must be specified.");

            var dropdownElement = BrowserAutomationHelper.FindElement(driver, findType, searchKeywords);
            if (dropdownElement == null)
                throw new InvalidOperationException($"No drop-down found using '{findType}': '{searchKeywords}'");

            var select = new SelectElement(dropdownElement);

            if (!select.IsMultiple && operation == DropDownListOperationEnum.SelectOptionsByIndex)
            {
                if (!int.TryParse(optionIndices ?? string.Empty, out int selectedIndex))
                    throw new FormatException("Invalid format for Option Indices.");
                select.SelectByIndex(selectedIndex);
                status = $"Selected option at index '{selectedIndex}' in '{searchKeywords}'.";
            }
            else if (!select.IsMultiple && operation == DropDownListOperationEnum.SelectOptionsByName)
            {
                if (useRegex)
                {
                    var matchedOption = dropdownElement.FindElements(By.TagName("option"))
                        .FirstOrDefault(e => System.Text.RegularExpressions.Regex.IsMatch(e.Text, optionNames ?? string.Empty));

                    if (matchedOption != null)
                    {
                        matchedOption.Click();
                        status = $"Selected option matching regex '{optionNames}' in '{searchKeywords}'.";
                    }
                    else
                    {
                        throw new InvalidOperationException("No option matched the regex pattern.");
                    }
                }
                else
                {
                    select.SelectByText(optionNames ?? string.Empty);
                    status = $"Selected option '{optionNames}' in '{searchKeywords}'.";
                }
            }
            else if (select.IsMultiple && operation == DropDownListOperationEnum.SelectOptionsByName)
            {
                var selectedOptions = (optionNames ?? string.Empty).Split(',');
                foreach (var option in selectedOptions)
                    select.SelectByText(option.Trim());
                status = $"Selected multiple options from '{searchKeywords}' by name.";
            }
            else if (select.IsMultiple && operation == DropDownListOperationEnum.SelectOptionsByIndex)
            {
                var indices = Array.ConvertAll((optionIndices ?? string.Empty).Split(','), int.Parse);
                foreach (var index in indices)
                    select.SelectByIndex(index);
                status = $"Selected multiple options from '{searchKeywords}' by index.";
            }
            else if (operation == DropDownListOperationEnum.ClearAllOptions)
            {
                select.DeselectAll();
                status = $"Cleared all selections in '{searchKeywords}'.";
            }
            else
            {
                throw new NotSupportedException("Unsupported operation for current drop-down type.");
            }

            if (waitForPage)
            {
                var wait = new WebDriverWait(driver, timeout);
                wait.Until(d =>
                    ((IJavaScriptExecutor)d).ExecuteScript("return document.readyState")?.Equals("complete") == true);
            }

            if (dialogAction != DialogActionEnum.DoNothing)
                try
                {
                    var alert = driver.SwitchTo().Alert();
                    if (dialogAction == DialogActionEnum.CloseIt)
                        alert.Accept();
                    else if (dialogAction == DialogActionEnum.PressAButton)
                        alert.SendKeys(dialogButton ?? string.Empty);
                }
                catch (NoAlertPresentException) { }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error setting dropdown value: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}

public enum DropDownListOperationEnum
{
    [Display(Name = "Clear All Options", Description = "Clears all selected values from the drop-down list.")]
    ClearAllOptions,

    [Display(Name = "Select Options by Name", Description = "Selects one or more options by their display text.")]
    SelectOptionsByName,

    [Display(Name = "Select Options by Index", Description = "Selects one or more options by their index position.")]
    SelectOptionsByIndex
}
