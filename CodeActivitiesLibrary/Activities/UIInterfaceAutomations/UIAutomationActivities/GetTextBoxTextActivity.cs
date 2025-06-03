using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Text from Text Box")]
    [Description("Reads and returns the text from a text box in a window using the property you choose.")]
    public class GetTextBoxTextActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]

        [DisplayName("Parent Window")]
        [Description("Select the window or parent element where the text box is located.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]

        [DisplayName("Property Type")]
        [Description("Choose how you want to search for the text box (by Name, ID, Class Name, or Control Type).")]
        [DefaultValue(PropertyTypeEnum.AutomationId)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]

        [DisplayName("Property Value")]
        [Description("Enter the value to search for (for example, the text box's name or ID).")]
        public InArgument<string> PropertyValue { get; set; }


        [DisplayName("Text Box Content")]
        [Description("The text found in the text box.")]
        public OutArgument<string> TextBoxContent { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);

            string textboxContent = "";
            string status = "";

            try
            {
                AutomationElement textboxElement = null;
                TextPattern textboxPattern = null;

                for (int i = 1; i <= 500; i++)
                {
                    try
                    {
                        textboxElement = parentElement.FindFirst(
                            TreeScope.Descendants,
                            UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue)
                        );
                        if (textboxElement != null)
                        {
                            textboxPattern = textboxElement.GetCurrentPattern(TextPattern.Pattern) as TextPattern;
                            if (textboxPattern != null)
                            {
                                textboxContent = textboxPattern.DocumentRange.GetText(-1).TrimEnd('\r');
                                status = "Text copied from the text box successfully.";
                                break;
                            }
                        }
                    }
                    catch
                    {
                        Thread.Sleep(10);
                    }
                }
                if (textboxElement == null || textboxPattern == null)
                {
                    textboxContent = "Error: Not able to copy text from TextBox";
                    status = "Could not find or read the text box.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error while reading text from the text box: {ex.Message}";
            }

            TextBoxContent.Set(context, textboxContent);
            StatusMessage.Set(context, status);
        }
    }
}