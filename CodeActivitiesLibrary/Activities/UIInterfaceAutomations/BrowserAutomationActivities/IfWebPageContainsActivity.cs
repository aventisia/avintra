using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities.Helpers;
using OpenQA.Selenium;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.BrowserAutomationActivities
{
    [DisplayName("If Web Page Contains")]
    [Description(
        "Checks if a web page contains a specific UI element or text. Optionally checks if the element is enabled or disabled.")]
    public class IfWebPageContainsActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Web Browser Instance")]
        [Description("Enter or choose the variable that contains the web browser instance to work with.")]
        public InArgument<IWebDriver> WebBrowserInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Check Condition")]
        [Description("Specifies what condition to check (e.g., contains element, contains text).")]
        [DefaultValue(CheckConditionEnum.ContainsElement)]
        public InArgument<CheckConditionEnum> CheckCondition { get; set; }


        [DisplayName("Find Type")]
        [Description("Specifies how to find the element (e.g., ID, XPath, CssSelector).")]
        [DefaultValue(ElementSelectorTypeEnum.XPath)]
        [RenderIfCondition(nameof(CheckCondition), CheckConditionEnum.ContainsElement)]
        [RenderIfCondition(nameof(CheckCondition), CheckConditionEnum.DoesNotContainElement)]
        public InArgument<ElementSelectorTypeEnum> FindType { get; set; } =
            new InArgument<ElementSelectorTypeEnum>(ElementSelectorTypeEnum.XPath);

        [DisplayName("Value To Find")]
        [Description("The value used to locate the element (e.g., 'username', '//input[@id='email']').")]
        [RenderIfCondition(nameof(CheckCondition), CheckConditionEnum.ContainsElement)]
        [RenderIfCondition(nameof(CheckCondition), CheckConditionEnum.DoesNotContainElement)]
        public InArgument<string> ValueToFind { get; set; }


        [DisplayName("Check UI Element State")]
        [Description("If true, checks whether the found element is enabled or disabled.")]
        [DefaultValue(false)]
        public InArgument<bool> CheckUiElementState { get; set; }


        [DisplayName("State")]
        [Description("Specifies the expected state of the element (enabled or disabled).")]
        [DefaultValue(ElementStateTypeEnum.Enabled)]
        public InArgument<ElementStateTypeEnum> State { get; set; }


        [DisplayName("Text To Search")]
        [Description("The text to search for in the web page body or title.")]
        [RenderIfCondition(nameof(CheckCondition), CheckConditionEnum.ContainsText)]
        public InArgument<string> TextToSearch { get; set; }


        [DisplayName("Search Location")]
        [Description("Specifies where to search for the text (e.g., Body, Title).")]
        [DefaultValue(SearchLocationEnum.Body)]
        public InArgument<SearchLocationEnum> SearchLocation { get; set; }

        [DisplayName("Result")]
        [Description("Returns true if the condition is met, otherwise false.")]
        public OutArgument<bool> Result { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            var result = false;

            try
            {
                var driver = WebBrowserInstance.Get(context);
                var checkCondition = CheckCondition.Get(context);
                var checkState = CheckUiElementState.Get(context);
                var expectedState = State.Get(context);
                var findType = FindType.Get(context);
                var searchKeywords = ValueToFind.Get(context);
                var textToSearch = TextToSearch.Get(context);
                var searchLocation = SearchLocation.Get(context);

                if (driver == null)
                    throw new ArgumentException("Web browser instance cannot be null.");

                switch (checkCondition)
                {
                    case CheckConditionEnum.ContainsElement:
                    case CheckConditionEnum.DoesNotContainElement:
                        if (string.IsNullOrWhiteSpace(searchKeywords))
                            throw new ArgumentException(
                                "Find type and search keywords must be specified when checking for an element.");

                        var by = BrowserAutomationHelper.GetWebElementLocator(findType, searchKeywords);
                        if (by == null)
                            throw new ArgumentException("Invalid find type provided.");

                        // Try to find the element
                        var element = BrowserAutomationHelper.FindElement(driver, findType, searchKeywords);
                        var elementExists = element != null;

                        switch (checkCondition)
                        {
                            // Check condition
                            case CheckConditionEnum.ContainsElement when elementExists:
                                result = true;
                                status = $"Found element '{searchKeywords}' using '{findType}'.";
                                break;
                            case CheckConditionEnum.DoesNotContainElement when !elementExists:
                                result = true;
                                status = $"Did not find element '{searchKeywords}' using '{findType}'.";
                                break;
                            case CheckConditionEnum.ContainsText:
                            case CheckConditionEnum.DoesNotContainText:
                            default:
                                {
                                    result = false;
                                    status = checkCondition == CheckConditionEnum.ContainsElement
                                        ? $"No element found using '{findType}': '{searchKeywords}'."
                                        : $"Element was found but should not exist.";
                                    break;
                                }
                        }

                        // Optional: Check element state (enabled/disabled)
                        if (checkState && element != null)
                        {
                            var isEnabled = element.Enabled;
                            result &= (expectedState == ElementStateTypeEnum.Enabled && isEnabled) ||
                                      (expectedState == ElementStateTypeEnum.Disabled && !isEnabled);

                            status += $" Element {(isEnabled ? "is enabled." : "is disabled.")}";
                        }

                        break;

                    case CheckConditionEnum.ContainsText:
                    case CheckConditionEnum.DoesNotContainText:
                        if (string.IsNullOrWhiteSpace(textToSearch))
                            throw new ArgumentException("Text to search must be specified when checking for text.");

                        var textSource = "";
                        switch (searchLocation)
                        {
                            case SearchLocationEnum.Body:
                                textSource = driver.FindElement(By.TagName("body"))?.Text ?? "";
                                break;
                            case SearchLocationEnum.Title:
                                textSource = driver.Title;
                                break;
                            default:
                                throw new ArgumentOutOfRangeException(nameof(searchLocation));
                        }

                        var containsText = textSource.IndexOf(textToSearch, StringComparison.OrdinalIgnoreCase) >= 0;

                        switch (checkCondition)
                        {
                            case CheckConditionEnum.ContainsText when containsText:
                                result = true;
                                status = $"Web page contains the text '{textToSearch}'.";
                                break;
                            case CheckConditionEnum.DoesNotContainText when !containsText:
                                result = true;
                                status = $"Web page does not contain the text '{textToSearch}'.";
                                break;
                            default:
                                result = false;
                                status = checkCondition == CheckConditionEnum.ContainsText
                                    ? $"Web page does not contain the text '{textToSearch}'."
                                    : $"Web page contains the text '{textToSearch}', which was unexpected.";
                                break;
                        }

                        break;

                    default:
                        throw new InvalidOperationException("Invalid check condition specified.");
                }

                Result.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error during condition check: {ex.Message}";
                result = false;
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }

        }
    }

    [Flags]
    public enum CheckConditionEnum
    {
        [Display(Name = "Contains Element", Description = "Checks if the web page contains a specific UI element.")]
        ContainsElement,

        [Display(Name = "Doesn't Contain Element",
            Description = "Checks if the web page does not contain a specific UI element.")]
        DoesNotContainElement,

        [Display(Name = "Contains Text", Description = "Checks if the web page contains a specific text.")]
        ContainsText,

        [Display(Name = "Doesn't Contain Text",
            Description = "Checks if the web page does not contain a specific text.")]
        DoesNotContainText
    }

    public enum ElementStateTypeEnum
    {
        [Display(Name = "Enabled", Description = "Specifies that the element should be enabled.")]
        Enabled,

        [Display(Name = "Disabled", Description = "Specifies that the element should be disabled.")]
        Disabled
    }

    public enum SearchLocationEnum
    {
        [Display(Name = "Body", Description = "Searches within the visible text of the page.")]
        Body,

        [Display(Name = "Title", Description = "Searches within the title of the web page.")]
        Title
    }
}