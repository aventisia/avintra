using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities.Expressions;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Text.Json;

namespace CodeActivityToJSON.Utils
{
    public static class ConvertActivityToJsonUtil
    {
        public static string ConvertActivityToJson(Type activityType)
        {
            var props = activityType.GetProperties(BindingFlags.Public | BindingFlags.Instance);
            var items = new List<object>();

            foreach (var prop in props)
            {
                // Get direction
                var direction = prop.PropertyType.Name.StartsWith("InArgument") ? "Input" :
                                prop.PropertyType.Name.StartsWith("OutArgument") ? "Output" : null;
                if (direction == null) continue;

                // Get label. If display name is not set, then don't add the argument to json
                var displayName = prop.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName ?? prop.Name; // TODO: we need to add meaningfull display names
                if (displayName == null || prop.Name.ToLower() == "statusmessage") continue;

                // Get description
                var description = prop.GetCustomAttribute<DescriptionAttribute>()?.Description ?? "";

                // Get required
                var required = prop.GetCustomAttribute<RequiredArgumentAttribute>() != null;

                // Create initial item dictionary
                var item = new Dictionary<string, object>
                {
                    ["direction"] = direction,
                    ["type"] = "text",
                    ["name"] = prop.Name,
                    ["label"] = displayName,
                    ["description"] = description,
                    ["defaultValue"] = "",
                    ["required"] = required
                };

                // If direction is output
                if (direction == "Output")
                {
                    item["type"] = "config-panel-output";
                    item["defaultValue"] = new
                    {
                        value = PascalToCamel(prop.Name) ?? "",
                        enabled = true
                    }; // Set default value to the property name
                }

                // If direction is Input and prop.Type is enum then type should be select
                if (direction == "Input" && prop.PropertyType.IsGenericType &&
                    prop.PropertyType.GetGenericTypeDefinition() == typeof(InArgument<>))
                {
                    // Get the default value of the property
                    item["defaultValue"] = GetInArgumentDefaultValue(prop, Activator.CreateInstance(activityType)); // create instance dynamically

                    // If the property is an enum, set type to select and get selectOptions
                    var genericType = prop.PropertyType.GenericTypeArguments.FirstOrDefault();
                    if (genericType != null && genericType.IsEnum)
                    {
                        // Get the default value of the property
                        item["defaultValue"] = GetInArgumentDefaultValue(prop, Activator.CreateInstance(activityType), true);

                        // Set type to select
                        item["type"] = "select";

                        // Get Select options from enum
                        item["selectOptions"] = GetEnumOptions(genericType);
                    }
                }

                // If direction is Input and prop.Type is boolean then type should be switch
                if (direction == "Input" && prop.PropertyType.IsGenericType &&
                    prop.PropertyType.GetGenericTypeDefinition() == typeof(InArgument<>))
                {
                    var genericType = prop.PropertyType.GenericTypeArguments.FirstOrDefault();

                    // Check if the generic type is boolean
                    if (genericType == typeof(bool))
                    {
                        // Set type to "switch" for boolean inputs
                        item["type"] = "switch";

                        // Get the default value of the boolean property
                        item["defaultValue"] = GetInArgumentDefaultValue(prop, Activator.CreateInstance(activityType));
                    }
                }

                // Get RenderIf attributes
                var renderIfConditions = prop.GetCustomAttributes<RenderIfConditionAttribute>().ToList();

                if (renderIfConditions.Count > 0)
                {
                    // Try to get RenderIfOperator attribute
                    var renderIfOperator = prop.GetCustomAttribute<RenderIfOperatorAttribute>()?.Operator ?? "AND";

                    // Convert conditions to array
                    var conditions = renderIfConditions.Select(c => new
                    {
                        field = c.Field,
                        equals = c.Equals
                    }).ToArray();

                    if (conditions.Length > 1)
                        item["renderIf"] = new { op = renderIfOperator, conditions };
                    else
                        item["renderIf"] = new { conditions };

                }

                items.Add(item);
            }

            var optionsJson = new JsonSerializerOptions { WriteIndented = true };
            return JsonSerializer.Serialize(items, optionsJson);
        }

        // Converts a PascalCase string to camelCase
        static string PascalToCamel(string input)
        {
            if (string.IsNullOrEmpty(input) || char.IsLower(input[0]))
                return input;

            // Just lower the first character
            return char.ToLowerInvariant(input[0]) + input.Substring(1);
        }

        // Get the default value of an InArgument property
        static object GetInArgumentDefaultValue(PropertyInfo property, object activityInstance, bool isEnum = false)
        {
            var defaultAttributeValue = property.GetCustomAttribute<DefaultValueAttribute>()?.Value;

            if (defaultAttributeValue != null)
            {
                // If DefaultValue is set, return it directly
                return isEnum ? defaultAttributeValue.ToString() : defaultAttributeValue;
            }

            var value = property.GetValue(activityInstance);

            if (value is InArgument inArg)
            {
                var expression = inArg.Expression;
                if (expression != null && expression.GetType().IsGenericType &&
                    expression.GetType().GetGenericTypeDefinition() == typeof(Literal<>))
                {
                    // Use reflection to get the 'Value' property of Literal<T>
                    var valProp = expression.GetType().GetProperty("Value");
                    var literalValue = valProp?.GetValue(expression);

                    // If it's an enum, return the name instead of the numeric value
                    if (literalValue is Enum enumValue)
                    {
                        return enumValue.ToString();
                    }

                    return literalValue;
                }
            }

            return "";
        }

        // Get enum options for select input type
        static List<object> GetEnumOptions(Type enumType)
        {
            var selectOptions = new List<object>();

            foreach (var enumValue in Enum.GetValues(enumType))
            {
                var field = enumType.GetField(enumValue.ToString());
                var displayAttr = field.GetCustomAttribute<DisplayAttribute>();

                var enumDisplayName = displayAttr?.Name ?? enumValue.ToString();
                var enumItemDescription = displayAttr?.Description ?? "";

                selectOptions.Add(new
                {
                    label = enumDisplayName,
                    value = enumValue.ToString(),
                    description = enumItemDescription
                });
            }

            return selectOptions;
        }
    }
}
