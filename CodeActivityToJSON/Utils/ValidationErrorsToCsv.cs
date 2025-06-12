using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Reflection;

namespace CodeActivityToJSON.Utils
{
    public static class ValidationErrosToCsvUtil
    {
        public static void ValidationErrorsToCsv(List<Type> activities)
        {
            var activityClasses = new List<(string MainCategory, string SubCategory, string NodeName, string Errors)>();

            foreach (var activity in activities)
            {
                // Skip activities
                if (activity.Name == "ConditionalActivity" || activity.Name == "ConditionalBranchActivity" || activity.Name == "LoopActivity")
                    continue;

                // Get error of activity
                var errors = CheckForPropertyErrors(activity);

                // ERROR: If namespace contains ".Activities." then skip the activity
                if (activity.Namespace != null && activity.Namespace.Contains(".Activities."))
                    errors.Add($"Activity '{activity.Name}' has Activities in the namespace.");

                // Split namespace to get MainCategory and SubCategory
                var namespaceParts = activity.Namespace?.Split('.') ?? new string[] { "Unknown Namespace" };

                // If the namespace has less than 3 parts, we assume no subcategory
                var mainCategory = namespaceParts.Length > 1 ? namespaceParts[1] : "No Main Category";
                var subCategory = namespaceParts.Length > 1 ? namespaceParts[2] : "No Subcategory";

                // If any CodeActivity has no display name which means its on hold
                var activityDisplayName = activity.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
                if (activityDisplayName == null || string.IsNullOrEmpty(activityDisplayName.DisplayName))
                {
                    Console.WriteLine($"Skipping {activity.Name} as it has no display name.");
                    continue;
                }

                // string.Join(Environment.NewLine, errors)

                if (errors.Count == 0) continue; // Skip if no errors


                // Get the NodeCategory and NodeName from the activity
                activityClasses.Add((
                    MainCategory: mainCategory,
                    SubCategory: subCategory,
                    NodeName: activityDisplayName.DisplayName,
                    Errors: string.Join("; ", errors)
                ));
            }

            // Write to CSV
            var outputCsvPath = @"C:\My Space\Gitea\Aventisia\studio\src\features\action-selector\constants\sample-activities-validation-errors.csv";
            using (var writer = new StreamWriter(outputCsvPath))
            {
                writer.WriteLine("MainCategory,SubCategory,NodeName,Errors");
                foreach (var entry in activityClasses)
                {
                    writer.WriteLine($"{entry.MainCategory},{entry.SubCategory},{entry.NodeName},{entry.Errors}");
                }
            }
        }

        public static List<string> CheckForPropertyErrors(Type activityType)
        {
            var errors = new List<string>();
            var props = activityType.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            // ERROR: If activityType has return type
            if (activityType.GetMethod("Execute")?.ReturnType.ToString().Length > 0)
                errors.Add($"Activity '{activityType.Name}' has a return type");

            foreach (var prop in props)
            {
                // If prop is IsSuccess or StatusMessage, then skip it
                if (prop.Name == "IsSuccess" || prop.Name == "StatusMessage" || prop.Name == "Id" || prop.Name == "DisplayName")
                    continue;

                // Get direction
                var direction = prop.PropertyType.Name.StartsWith("InArgument") ? "Input" :
                                prop.PropertyType.Name.StartsWith("OutArgument") ? "Output" : null;

                // ERROR: If direction is null, then the property is not an InArgument or OutArgument
                if (direction == null)
                    errors.Add($"Property '{prop.Name}' has an unsupported type: {prop.PropertyType.Name}.");

                // Get label. If display name is not set, then don't add the argument to json
                var displayName = prop.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName;

                // ERROR: If display name is null or empty, then the property has no display name
                if (displayName == null)
                    errors.Add($"Property '{prop.Name}' has no display name.");

                // Get description
                var description = prop.GetCustomAttribute<DescriptionAttribute>()?.Description;

                // ERROR: If description is null, then the property has no description
                if (description == null)
                    errors.Add($"Property '{prop.Name}' has no description.");

                // ERROR: Property should not have a Category attribute
                if (prop.GetCustomAttribute<CategoryAttribute>()?.Category != null)
                    errors.Add($"Property '{prop.Name}' should not have a Category attribute");

                // Error: If direction is Input and required argument is not set, then default value should be set
                if (direction == "Input" && prop.GetCustomAttribute<RequiredArgumentAttribute>() == null)
                {
                    // Get defaultValue
                    if (prop.GetCustomAttribute<DefaultValueAttribute>() == null)
                        errors.Add($"If property '{prop.Name}' is optional then it should have default value attribute.");
                }


                // If direction is Input and prop.Type is enum then type should be select
                if (direction == "Input" && prop.PropertyType.IsGenericType &&
                    prop.PropertyType.GetGenericTypeDefinition() == typeof(InArgument<>))
                {
                    // If the property is an enum
                    var genericType = prop.PropertyType.GenericTypeArguments.FirstOrDefault();
                    if (genericType != null && genericType.IsEnum)
                    {
                        // Loop through enum values to check for DisplayAttribute
                        foreach (var enumValue in Enum.GetValues(genericType))
                        {
                            var field = genericType.GetField(enumValue.ToString());
                            var displayAttr = field.GetCustomAttribute<DisplayAttribute>();

                            // ERROR: If enum value has no DisplayAttribute
                            if (displayAttr == null)
                            {
                                errors.Add($"Enum value '{enumValue}' in property '{prop.Name}' has no DisplayAttribute.");
                                continue; // Skip to next enum value if DisplayAttribute is missing
                            }

                            // ERROR: If enum value has no Description in DisplayAttribute
                            if (string.IsNullOrEmpty(displayAttr?.Name))
                                errors.Add($"Enum value '{enumValue}' in property '{prop.Name}' has no display name");

                            // ERROR: If enum value has no Description in DisplayAttribute
                            if (string.IsNullOrEmpty(displayAttr?.Description))
                                errors.Add($"Enum value '{enumValue}' in property '{prop.Name}' has no description");
                        }
                    }
                }

                // Get RenderIf attributes
                var renderIfConditions = prop.GetCustomAttributes<RenderIfConditionAttribute>().ToList();

                if (renderIfConditions.Count > 0)
                {
                    foreach (var condition in renderIfConditions)
                    {
                        // ERROR: The DataType of condition.Equals cannot be string
                        if (condition.Equals == null || condition.Equals.GetType() != typeof(string))
                            errors.Add($"Property '{prop.Name}' has a RenderIfCondition with an unsupported type for Equals: {condition.Equals?.GetType().Name}.");
                    }
                }
            }

            return errors;
        }
    }
}