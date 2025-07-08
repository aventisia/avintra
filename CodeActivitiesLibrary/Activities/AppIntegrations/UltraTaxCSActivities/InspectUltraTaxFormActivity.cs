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
        [DisplayName("Number of Fields to Inspect")]
        [Description("Specify the number of fields to inspect")]
        public InArgument<string> NoOfFieldsToInspect { get; set; }

        [DisplayName("Inspection Output")]
        [Description("The output object containing inspection details of the form fields.")]
        public OutArgument<JArray> InspectionOutput { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            var noOfFieldsToInspect = NoOfFieldsToInspect.Get(context);
            string statusMessage = "";

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
                var formFieldFinalList = new List<FormElementDetails>();
                var excludedAutomationIds = new HashSet<string>
                {
                    "NonClientVerticalScrollBar", "UpButton", "DownButton", "UpPageButton", "DownPageButton", "ScrollbarThumb", "DropDown"
                };
                var excludedNames = new HashSet<string>
                {
                    "Vertical", "Line up", "Line down", "Page up", "Page down", "Position", "Open"
                };
                var excludedControlTypes = new HashSet<string>
                {
                    "ScrollBar", "Thumb", "Button"
                };

                do
                {
                    // Get all descendants of the form element (assuming the focus is on the first form field)
                    var allDescendants = formElement.FindAllDescendants();
                    var formFields = allDescendants
                                        .Where(field =>
                                            // Exclude if it's a ScrollBar
                                            field.ControlType.ToString() != "ScrollBar" &&
                                            // Exclude if it's a Thumb or Button with excluded AutomationId or Name
                                            !(excludedControlTypes.Contains(field.ControlType.ToString()) &&
                                            excludedAutomationIds.Contains(field.Properties.AutomationId.ValueOrDefault) &&
                                            excludedNames.Contains(field.Properties.Name.ValueOrDefault))
                                        )
                                        .ToArray();

                    // Add the inspected fields to the output list
                    foreach (var field in formFields)
                    {
                        // Create a new FormElementDetails object
                        var formElementDetails = new FormElementDetails
                        {
                            Index = fieldIndex,
                            UniqueId = GetUniqueId(fieldIndex, field),
                            Name = field.Properties.Name.ValueOrDefault?.Trim() ?? "Not Available",
                            ClassName = field.Properties.ClassName.ValueOrDefault ?? "Not Available",
                            ControlType = field.ControlType.ToString() ?? "Not Available",
                            FrameworkId = field.Properties.FrameworkId.ValueOrDefault ?? "Not Available",
                            AutomationId = field.Properties.AutomationId.ValueOrDefault ?? "Not Available",
                            IsEnabled = field.Properties.IsEnabled.ValueOrDefault,
                            IsOffscreen = field.Properties.IsOffscreen.ValueOrDefault,
                            IsPassword = field.Properties.IsPassword.ValueOrDefault,
                            BoundingRectangle = GetBoundingRectangle(field),
                            LabelText = field.Properties.Name.ValueOrDefault?.Trim() ?? "Not Available",
                            SupportedPatterns = GetSupportedPatterns(field)
                        };

                        // If the field doesn't exist in the final list, add it
                        if (!formFieldFinalList.Any(x =>
                                    x.Name == formElementDetails.Name &&
                                    x.ClassName == formElementDetails.ClassName &&
                                    x.ControlType == formElementDetails.ControlType &&
                                    x.FrameworkId == formElementDetails.FrameworkId &&
                                    x.AutomationId == formElementDetails.AutomationId &&
                                    x.BoundingRectangle.ToString() == formElementDetails.BoundingRectangle.ToString()))
                        {
                            formFieldFinalList.Add(formElementDetails);
                            fieldIndex++;
                        }
                    }

                    // Break if tabCounter exceeds specified number of fields to inspect
                    if (tabCounter > int.Parse(noOfFieldsToInspect))
                        break;

                    // Press TAB to move to the next field
                    Keyboard.Press(VirtualKeyShort.TAB);

                    // Increment tab counter
                    tabCounter++;

                } while (true);

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

        private string GetUniqueId(int fieldIndex, AutomationElement element)
        {
            string uniqueId = $"{fieldIndex}";

            if (element.Properties.Name.ValueOrDefault != null)
            {
                var name = element.Properties.Name.ValueOrDefault.Trim();
                // Replace spaces and newlines in the name to create a unique identifier
                name = name.Replace(" ", "").Replace("\n", "").Replace("\r", "").Replace("\t", "").Replace("  ", "");
                name = name.Replace(":", "").Replace(";", "").Replace(",", "").Replace(".", "");
                name = name.Replace("-", "").Replace("(", "").Replace(")", "").Replace("+", "");
                name = name.Replace("'", "").Replace("\"", "").Replace("/", "").Replace("\\", "");
                name = name.Replace("?", "").Replace("!", "").Replace("&", "").Replace("#", "").Replace("$", "");
                name = name.Replace("@", "").Replace("*", "").Replace("=", "").Replace("<", "").Replace(">", "");
                name = name.Replace("`", "").Replace("~", "").Replace("|", "").Replace("{", "").Replace("}", "");
                name = name.Replace("+", "").Replace("*", "");
                uniqueId += $"_{name}";
            }
            else
            {
                uniqueId += "_NO_NAME";
            }
            // Generate a unique ID based on the element's properties
            return $"{uniqueId}_{element.Properties.ClassName.ValueOrDefault}_{element.Properties.ControlType.ToString()}_{element.Properties.FrameworkId.ValueOrDefault}";
        }

        private JArray GetSupportedPatterns(AutomationElement element)
        {
            var patternNames = element.GetSupportedPatterns()
                    .Select(pattern => pattern.ToString().Split('[')[0].Trim())
                    .Where(name => !string.Equals(name, "LegacyIAccessible", StringComparison.OrdinalIgnoreCase))
                    .ToList();

            // Replace "Text2" and "Text" with "GetValue", and "Value" with "SetValue"
            for (int i = 0; i < patternNames.Count; i++)
            {
                if (patternNames[i] == "Text2" || patternNames[i] == "Text")
                    patternNames[i] = "GetValue";
                else if (patternNames[i] == "Value")
                    patternNames[i] = "SetValue";
                else if (patternNames[i] == "Invoke")
                    patternNames[i] = "Click";
            }

            // Ensure distinct after replacements
            return JArray.FromObject(patternNames.Distinct().ToList());
        }

        private JObject GetBoundingRectangle(AutomationElement element)
        {
            var rect = element.Properties.BoundingRectangle.ValueOrDefault;
            return JObject.FromObject(new
            {
                X = rect.X,
                Y = rect.Y,
                Width = rect.Width,
                Height = rect.Height
            });
        }
    }

    public class FormElementDetails
    {
        public int Index { get; set; }
        public string UniqueId { get; set; }
        public string Name { get; set; }
        public string ClassName { get; set; }
        public string ControlType { get; set; }
        public string FrameworkId { get; set; }
        public string AutomationId { get; set; }
        public bool IsEnabled { get; set; }
        public bool IsOffscreen { get; set; }
        public bool IsPassword { get; set; }
        public JObject BoundingRectangle { get; set; }
        public string LabelText { get; set; }
        public JArray SupportedPatterns { get; set; }
    }
}