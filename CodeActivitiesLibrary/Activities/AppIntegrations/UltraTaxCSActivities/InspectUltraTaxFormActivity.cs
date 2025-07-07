using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using FlaUI.Core.AutomationElements;
using FlaUI.Core.Definitions;
using FlaUI.Core.Input;
using FlaUI.Core.WindowsAPI;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.UltraTaxCSActivities
{
    [DisplayName("Inspect UltraTax Form")]
    [Description("Get inspection details of a UI element in an UltraTax CS form, such as name, position etc.")]
    public class InspectUltraTaxFormActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Form Element")]
        [Description("The form element to inspect.")]
        public InArgument<string> IdentificationObjectPath { get; set; }

        [RequiredArgument]
        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait to find the form element (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [RequiredArgument]
        [DisplayName("Fields Inspection Type")]
        [Description("Choose how to determine the number of fields to inspect: 'Automatic' lets the system decide, 'Manual' allows you to specify.")]
        [DefaultValue(InspectionTypeEnum.Auto)]
        public InArgument<InspectionTypeEnum> InspectionType { get; set; }

        [DisplayName("Number of Fields to Inspect")]
        [Description("Specify the number of fields to inspect")]
        [DefaultValue("3")]
        [RenderIfCondition(nameof(InspectionType), InspectionTypeEnum.Manual)]
        public InArgument<string> NoOfFieldsToInspect { get; set; }

        [DisplayName("Inspection Output")]
        [Description("The output object containing inspection details of the form fields.")]
        public OutArgument<JObject> InspectionOutput { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            var inspectionType = InspectionType.Get(context);
            var noOfFieldsToInspect = NoOfFieldsToInspect.Get(context);
            string statusMessage = "";
            bool isSuccess = false;

            // Clear output
            InspectionOutput.Set(context, null);

            try
            {
                // Get form element instance
                var formElement = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                // Form element not found
                if (formElement == null)
                {
                    statusMessage = "Form element not found. Please check the identification path.";
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, statusMessage);
                    return;
                }


                // Initialize index and list for form element details
                int tabCounter = 0;
                int fieldIndex = 0;
                int fieldMatchCounter = 0;
                AutomationElement[] lastFormFields = null;
                var formFieldFinalList = new List<FormElementDetails>();

                do
                {
                    // Get all descendants of the form element (assuming the focus is on the first form field)
                    var allDescendants = formElement.FindAllDescendants();
                    var formFields = allDescendants
                        .Where(field => field.ControlType != ControlType.ScrollBar)
                        .ToArray();

                    // Add the inspected fields to the output list
                    foreach (var field in formFields)
                    {
                        // Create a new FormElementDetails object
                        formFieldFinalList.Add(new FormElementDetails
                        {
                            Index = fieldIndex,
                            Name = field.Properties.Name.ValueOrDefault?.Trim() ?? "Not Available",
                            ClassName = field.Properties.ClassName.ValueOrDefault ?? "Not Available",
                            ControlType = field.ControlType.ToString() ?? "Not Available",
                            FrameworkId = field.Properties.FrameworkId.ValueOrDefault ?? "Not Available",
                            AutomationId = field.Properties.AutomationId.ValueOrDefault ?? "Not Available",
                            IsEnabled = field.Properties.IsEnabled.ValueOrDefault,
                            IsOffscreen = field.Properties.IsOffscreen.ValueOrDefault,
                            IsPassword = field.Properties.IsPassword.ValueOrDefault,
                            BoundingRectangle = JObject.FromObject(field.Properties.BoundingRectangle.ValueOrDefault),
                            ClickablePoint = JObject.FromObject(field.Properties.ClickablePoint.ValueOrDefault),
                            LabelText = field.Properties.Name.ValueOrDefault?.Trim() ?? "Not Available",
                            SupportedPatterns = JObject.FromObject(field.GetSupportedPatterns())
                        });
                        fieldIndex++;
                    }

                    // Press Tab to move to the next field
                    if (inspectionType == InspectionTypeEnum.Manual)
                    {
                        // Break if tabCounter exceeds specified number of fields to inspect
                        if (tabCounter > int.Parse(noOfFieldsToInspect))
                            break;

                        // Press TAB to move to the next field
                        Keyboard.Press(VirtualKeyShort.TAB);

                        // Increment tab counter
                        tabCounter++;
                    }
                    else if (inspectionType == InspectionTypeEnum.Auto)
                    {
                        // If the match counter exceeds 3, break the loop
                        if (fieldMatchCounter > 3)
                            break;

                        // Press TAB to move to the next field
                        Keyboard.Press(VirtualKeyShort.TAB);

                        // If the last inspected field is the same as the current field, increment the match counter
                        if (lastFormFields != null && formFields != null && lastFormFields == formFields)
                            fieldMatchCounter++;
                        else
                            fieldMatchCounter = 0;
                    }

                    // Save the last inspected fields
                    if (formFields != null && formFields.Length > 0)
                        lastFormFields = formFields;

                } while (false);

                // Set the output
                InspectionOutput.Set(context, JArray.FromObject(formFieldFinalList));
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error retrieving UI element details: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
    }

    public enum InspectionTypeEnum
    {
        [Display(Name = "Automatic", Description = "Automatically determine number of fields to inspect.")]
        Auto,

        [Display(Name = "Manual", Description = "Manually specify number of fields to inspect.")]
        Manual
    }

    public class FormElementDetails
    {
        public int Index { get; set; }
        public string Name { get; set; }
        public string ClassName { get; set; }
        public string ControlType { get; set; }
        public string FrameworkId { get; set; }
        public string AutomationId { get; set; }
        public bool IsEnabled { get; set; }
        public bool IsOffscreen { get; set; }
        public bool IsPassword { get; set; }
        public JObject BoundingRectangle { get; set; }
        public JObject ClickablePoint { get; set; }
        public string LabelText { get; set; }
        public JObject SupportedPatterns { get; set; }
    }
}