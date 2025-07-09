using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.UiAutomationActivities.Helpers;
using FlaUI.Core.Input;
using FlaUI.Core.WindowsAPI;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.IO;
using CodeActivitiesLibrary.AppIntegrations.UltraTaxCSActivities.Helpers;
using System.Windows.Documents;
using System.Threading;

namespace CodeActivitiesLibrary.AppIntegrations.UltraTaxCSActivities
{
    [DisplayName("Fill UltraTax Form")]
    [Description("Fill an UltraTax CS form by inspecting UI elements and mapping them to a JSON content")]
    public class FillUltraTaxFormActivity : BaseCodeActivity
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

        [RequiredArgument]
        [DisplayName("Form Fields to JSON Fields Mapping File Path")]
        [Description("The full path to the JSON file where the mapping of form fields to JSON fields is written.")]
        public InArgument<string> FormJsonFieldsMappingFilePath { get; set; }

        [RequiredArgument]
        [DisplayName("JSON data to fill the form")]
        [Description("The JSON data that will be used to fill the form fields.")]
        public InArgument<string> JsonDataToFill { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var identificationObjectPath = UIAutomationElementHelper.ConvertIdentificationObjectPath(IdentificationObjectPath.Get(context));
            var maxWaitTime = MaxWaitTime.Get(context);
            var noOfFieldsToInspect = NoOfFieldsToInspect.Get(context);
            var mappingFilePath = FormJsonFieldsMappingFilePath.Get(context);
            var jsonDataToFill = JsonDataToFill.Get(context);


            // Validate inputs
            if (!File.Exists(mappingFilePath))
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Mapping file not found at {mappingFilePath}. Please check the file path.");
                return;
            }

            if (string.IsNullOrEmpty(jsonDataToFill))
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "JSON data object to fill the form is empty. Please provide valid JSON data.");
                return;
            }

            try
            {
                // Get form element instance
                var formElement = UIAutomationElementHelper.GetElementByPath(identificationObjectPath, maxWaitTime);

                // Form element not found
                if (formElement == null)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Form element not found. Please check the identification path.");
                    return;
                }

                // Read the JSON mapping file (expected an array of objects)
                var mappingArray = JArray.Parse(File.ReadAllText(mappingFilePath));
                if (mappingArray == null || !mappingArray.HasValues)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Invalid mapping file. Please check the JSON content.");
                    return;
                }

                // Read the JSON data object to fill the form
                var jsonData = JObject.Parse(jsonDataToFill);
                if (jsonData == null || !jsonData.HasValues)
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Invalid JSON data to fill the form. Please check the JSON content.");
                    return;
                }

                // Get dictionary of UniqueId to value
                var formFieldValues = UltraTaxFormHelper.GetFormFieldValuesFromMapping(mappingArray, jsonData);

                // Initialize index and list for form element details
                int tabCounter = 0;
                var formFieldFinalList = new List<FormElementDetails>();

                // Press Ctrl + Home to focus on the first form field
                for (int i = 0; i < 3; i++)
                {
                    Keyboard.TypeSimultaneously(VirtualKeyShort.CONTROL, VirtualKeyShort.HOME);
                    Thread.Sleep(100);
                }

                Thread.Sleep(500);

                do
                {
                    // Get all descendants of the form element (assuming the focus is on the first form field)
                    var allDescendants = formElement.FindAllDescendants();
                    var formFields = allDescendants
                                        .Where(field =>
                                            // Exclude if it's a ScrollBar
                                            field.ControlType.ToString() != "ScrollBar" &&
                                            // Exclude if it's a Thumb or Button with excluded AutomationId or Name
                                            !(UltraTaxFormHelper.excludedControlTypes.Contains(field.ControlType.ToString()) &&
                                            UltraTaxFormHelper.excludedAutomationIds.Contains(field.Properties.AutomationId.ValueOrDefault) &&
                                            UltraTaxFormHelper.excludedNames.Contains(field.Properties.Name.ValueOrDefault))
                                        )
                                        .ToArray();

                    // Add the inspected fields to the output list
                    foreach (var field in formFields)
                    {
                        // Create a new FormElementDetails object
                        var formElementDetails = new FormElementDetails
                        {
                            TabIndex = tabCounter,
                            UniqueId = UltraTaxFormHelper.GetUniqueId(tabCounter, field),
                            Name = field.Properties.Name.ValueOrDefault?.Trim() ?? "Not Available",
                            ClassName = field.Properties.ClassName.ValueOrDefault ?? "Not Available",
                            ControlType = field.ControlType.ToString() ?? "Not Available",
                            FrameworkId = field.Properties.FrameworkId.ValueOrDefault ?? "Not Available",
                            AutomationId = field.Properties.AutomationId.ValueOrDefault ?? "Not Available",
                            IsEnabled = field.Properties.IsEnabled.ValueOrDefault,
                            IsOffscreen = field.Properties.IsOffscreen.ValueOrDefault,
                            IsPassword = field.Properties.IsPassword.ValueOrDefault,
                            BoundingRectangle = UltraTaxFormHelper.GetBoundingRectangle(field),
                            LabelText = field.Properties.Name.ValueOrDefault?.Trim() ?? "Not Available",
                            SupportedPatterns = UltraTaxFormHelper.GetSupportedPatterns(field)
                        };

                        // If the field doesn't exist in the final list, add it
                        if (!formFieldFinalList.Any(x =>
                                    x.Name == formElementDetails.Name &&
                                    x.ClassName == formElementDetails.ClassName &&
                                    x.ControlType == formElementDetails.ControlType &&
                                    x.FrameworkId == formElementDetails.FrameworkId &&
                                    x.AutomationId == formElementDetails.AutomationId &&
                                    UltraTaxFormHelper.AreJObjectsEqual(x.BoundingRectangle, formElementDetails.BoundingRectangle)))
                        {
                            formFieldFinalList.Add(formElementDetails);
                        }

                        // Try to find the field in the formFieldValues dictionary using UniqueId list
                        string formFieldValue = null;
                        string matchedUniqueId = null;
                        foreach (var uniqueId in formElementDetails.UniqueId)
                        {
                            if (formFieldValues.TryGetValue(uniqueId, out formFieldValue))
                            {
                                matchedUniqueId = uniqueId;
                                break;
                            }
                        }

                        if (formFieldValue != null)
                        {
                            try
                            {
                                var valuePattern = field.Patterns.Value.PatternOrDefault;
                                if (valuePattern != null)
                                {
                                    valuePattern.SetValue(formFieldValue);
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Error processing field {matchedUniqueId}: {ex.Message}");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"Field not found {matchedUniqueId}");
                        }
                    }

                    // Break if tabCounter exceeds specified number of fields to inspect
                    if (tabCounter > int.Parse(noOfFieldsToInspect))
                        break;

                    // Press TAB to move to the next field
                    Keyboard.Press(VirtualKeyShort.TAB);
                    Thread.Sleep(100);

                    // Increment tab counter
                    tabCounter++;

                } while (true);

                // Set the output
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Filling UltraTax form completed successfully.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error retrieving UI element details: {ex.Message}");
                IsSuccess.Set(context, false);
            }
        }
    }
}