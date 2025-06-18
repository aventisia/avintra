using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Enums;
using CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Element Collection")]
    [Description("Finds and returns a collection of UI elements under a parent element using the specified property type and value.")]
    public class GetElementCollectionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Parent Element")]
        [Description("The parent UI element under which to search for matching elements.")]
        public InArgument<AutomationElement> ParentElement { get; set; }

        [RequiredArgument]
        [DisplayName("Property Type")]
        [Description("The property type to search by (e.g., Name, AutomationId, ClassName, ControlType).")]
        [DefaultValue(PropertyTypeEnum.Name)]
        public InArgument<PropertyTypeEnum> PropertyType { get; set; }

        [RequiredArgument]
        [DisplayName("Property Value")]
        [Description("The value of the property to match for the elements.")]
        [DefaultValue("")]
        public InArgument<string> PropertyValue { get; set; }


        [DisplayName("Element Collection")]
        [Description("The collection of found UI elements.")]
        public OutArgument<AutomationElementCollection> ElementCollection { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var parentElement = ParentElement.Get(context);
            var propertyType = PropertyType.Get(context);
            var propertyValue = PropertyValue.Get(context);

            AutomationElementCollection elements = null;
            string status = "";

            try
            {
                var condition = UIAutomationElementHelper.CreatePropertyCondition(propertyType, propertyValue);
                elements = parentElement?.FindAll(TreeScope.Descendants, condition);
                status = elements != null && elements.Count > 0
                    ? $"Found {elements.Count} element(s)."
                    : "No matching elements found.";

                ElementCollection.Set(context, elements);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}