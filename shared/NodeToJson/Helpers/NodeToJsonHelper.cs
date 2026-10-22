namespace NodeToJson.Helpers;

public static class NodeToJsonHelper
{
    static List<string> _excludedInputOutput = new List<string>
    {
        "StatusMessage",
        "IsSuccess",
        "FlowMetadata",
        "JobContext",
        "CallerContext"
    };

    static Dictionary<NodeFieldTypeEnum, string> fieldTypeMapping = new Dictionary<NodeFieldTypeEnum, string>
    {
        { NodeFieldTypeEnum.Number, "number" },
        { NodeFieldTypeEnum.Email, "email" },
        { NodeFieldTypeEnum.File, "file" },
        { NodeFieldTypeEnum.Color, "color" },
        { NodeFieldTypeEnum.Date, "text" },
        { NodeFieldTypeEnum.Time, "time" },
        { NodeFieldTypeEnum.DateTime, "text" },
        { NodeFieldTypeEnum.Text, "text" },
        { NodeFieldTypeEnum.Textarea, "textarea" },
        { NodeFieldTypeEnum.Select, "select" },
        { NodeFieldTypeEnum.Switch, "switch" },
        { NodeFieldTypeEnum.ConditionGroups, "condition-groups" },
        { NodeFieldTypeEnum.ConfigPanelOutput, "config-panel-output" },
        { NodeFieldTypeEnum.ModelSelect, "model-select" },
        { NodeFieldTypeEnum.CredentialsSelect, "credentials-select" },
        { NodeFieldTypeEnum.QueueSelect, "queue-select" },
        { NodeFieldTypeEnum.QueueStatusSelect, "queue-status-select" },
        { NodeFieldTypeEnum.FlowSelect, "flow-select" },
        { NodeFieldTypeEnum.CloudExecutionSwitch, "cloud-execution-switch" },
        { NodeFieldTypeEnum.JsonEditor, "json-editor" },
        { NodeFieldTypeEnum.CodeEditor, "code-editor" },
        { NodeFieldTypeEnum.ConfigPanelModelOutput, "config-panel-model-output" }
    };

    public static string ConvertNodeToJson(Type nodeType, List<string> supportedPlatforms)
    {
        // Get the DisplayName and Description attributes from the node
        var nodeMetaDataAttr = nodeType.GetCustomAttributes(typeof(NodeMetadataAttribute), false).FirstOrDefault() as NodeMetadataAttribute;
        var nodeDisplayNameAttr = nodeType.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
        var nodeDescriptionAttr = nodeType.GetCustomAttributes(typeof(DescriptionAttribute), false).FirstOrDefault() as DescriptionAttribute;

        if (nodeMetaDataAttr == null || nodeDisplayNameAttr == null || nodeDescriptionAttr == null)
        {
            throw new InvalidOperationException($"Node class {nodeType.Name} is missing DisplayName, Description, or NodeMetaData attribute.");
        }

        var nodeJson = new Dictionary<string, object>
        {
            ["name"] = nodeType.Name,
            ["label"] = nodeDisplayNameAttr.DisplayName,
            ["description"] = nodeDescriptionAttr.Description,
            ["version"] = nodeMetaDataAttr.Version,
            ["author"] = nodeMetaDataAttr.Author,
            ["supportedPlatforms"] = supportedPlatforms,
            ["errorHandling"] = nodeMetaDataAttr.ErrorHandling,
            ["testScreenType"] = nodeMetaDataAttr.TestScreenType
        };

        // Only include the badge if it is present on the node
        if (!string.IsNullOrWhiteSpace(nodeMetaDataAttr.Badge))
        {
            nodeJson["badge"] = nodeMetaDataAttr.Badge;
        }

        // Get input and output arguments using reflection
        var props = nodeType.GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var fields = new List<object>();
        foreach (var prop in props)
        {
            // Get direction
            var direction = prop.PropertyType.Name.StartsWith("InArgument") ? "Input" : prop.PropertyType.Name.StartsWith("OutArgument") ? "Output" : null;
            if (direction == null) continue;

            // Get attributes for label, description, required
            var displayName = prop.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName;
            var description = prop.GetCustomAttribute<DescriptionAttribute>()?.Description;
            var isRequired = prop.GetCustomAttributes(false).Any(attr => attr.GetType().FullName == "System.Runtime.CompilerServices.RequiredMemberAttribute");

            // Skip if displayName or description is null or if the property is in the excluded list
            if (displayName == null || description == null || _excludedInputOutput.Contains(prop.Name!)) continue;

            // Create initial field dictionary
            var field = new Dictionary<string, object>
            {
                ["direction"] = direction,
                ["type"] = "text",
                ["name"] = prop.Name!,
                ["label"] = displayName,
                ["description"] = description,
                ["defaultValue"] = "",
                ["required"] = isRequired
            };

            // If direction is output
            if (direction == "Output")
            {
                field["type"] = "config-panel-output";
                field["defaultValue"] = new
                {
                    value = prop.Name ?? "",
                    enabled = true
                }; // Set default value to the property name
            }

            // If direction is Input and prop.Type is enum then type should be select
            if (direction == "Input" && prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(InArgument<>))
            {
                // Create an instance of the node once to read default argument values.
                // Activator.CreateInstance returns object? but for a class type the result is non-null.
                var nodeInstance = Activator.CreateInstance(nodeType)!;

                // Get the default value of the property for all input and generic types
                field["defaultValue"] = GetInArgumentDefaultValue(prop, nodeInstance); // create instance dynamically

                // If the property is an enum, set type to select and get selectOptions
                var genericType = prop.PropertyType.GenericTypeArguments.FirstOrDefault();
                if (genericType != null && genericType.IsEnum)
                {
                    // Get the default value of the property for enum types and convert it to string if it's not null
                    field["defaultValue"] = GetInArgumentDefaultValue(prop, nodeInstance, isEnum: true);

                    // Set type to select
                    field["type"] = "select";

                    // Get Select options from enum
                    field["selectOptions"] = GetEnumOptions(genericType);
                }
                else if (genericType != null && genericType == typeof(bool))
                {
                    // Set type to "switch" for boolean inputs
                    field["type"] = "switch";

                    // Get the default value of the boolean property
                    field["defaultValue"] = GetInArgumentDefaultValue(prop, nodeInstance);
                }
                else if (genericType != null && genericType == typeof(System.Security.SecureString))
                {
                    field["type"] = "password";
                }
            }

            // If NodeFieldType attribute is present then override the type based on the mapping
            var fieldTypeAttr = prop.GetCustomAttribute<NodeFieldTypeAttribute>();
            if (fieldTypeAttr != null && direction == "Input" && prop.PropertyType.GetGenericTypeDefinition() == typeof(InArgument<>))
            {
                if (fieldTypeMapping.TryGetValue(fieldTypeAttr.FieldType, out var fieldTypeStr))
                {
                    field["type"] = fieldTypeStr;
                }
            }

            // If NodeFieldPlaceholder attribute is present then add placeholder to the field
            var placeholderAttr = prop.GetCustomAttribute<NodeFieldPlaceholderAttribute>();
            if (placeholderAttr != null)
            {
                field["placeholder"] = placeholderAttr.Placeholder;
            }

            // If DependsOn attribute is present then add the dependency to the field
            var dependsOnAttr = prop.GetCustomAttribute<DependsOnAttribute>();
            if (dependsOnAttr != null)
            {
                field["dependsOn"] = dependsOnAttr.FieldName;
            }

            // Get RenderIf attributes
            var renderIfConditions = prop.GetCustomAttributes<RenderIfConditionAttribute>().ToList();

            if (renderIfConditions.Count > 0)
            {
                // Try to get RenderIfOperator attribute
                var renderIfOperator = prop.GetCustomAttribute<RenderIfOperatorAttribute>()?.Operator ?? LogicalOperatorEnum.AND;

                // Convert conditions to array
                var conditions = renderIfConditions.Select(c => new
                {
                    field = c.Field,
                    equals = c.Equals
                }).ToArray();

                if (conditions.Length > 1)
                    field["renderIf"] = new { op = renderIfOperator, conditions };
                else
                    field["renderIf"] = new { conditions };

            }

            fields.Add(field);
        }

        // Add fields to nodeJson
        nodeJson["fields"] = fields;

        var optionsJson = new JsonSerializerOptions { WriteIndented = true };
        return JsonSerializer.Serialize(nodeJson, optionsJson);
    }

    // Helper: Get the default value of an InArgument property
    static object GetInArgumentDefaultValue(PropertyInfo property, object nodeInstance, bool isEnum = false)
    {
        var defaultAttributeValue = property.GetCustomAttribute<DefaultValueAttribute>()?.Value;

        // If DefaultValue is set, return it directly
        if (defaultAttributeValue != null)
        {
            return isEnum ? defaultAttributeValue.ToString()! : defaultAttributeValue;
        }

        var value = property.GetValue(nodeInstance);

        if (value is NodeArgument nodeArg)
        {
            // Use reflection to get the internal 'Value' property of NodeArgument
            var valProp = typeof(NodeArgument).GetProperty("Value", BindingFlags.NonPublic | BindingFlags.Instance);
            var argumentValue = valProp?.GetValue(nodeArg);

            if (argumentValue != null)
            {
                // If it's an enum, return the name instead of the numeric value
                if (argumentValue is Enum enumValue)
                {
                    return enumValue.ToString();
                }

                // IntPtr cannot be serialized by System.Text.Json; represent as a string
                if (argumentValue is IntPtr ptr)
                {
                    return ptr == IntPtr.Zero ? "" : ptr.ToString();
                }

                return argumentValue;
            }
        }

        return "";
    }

    // Helper: Get enum options for select input type
    static List<object> GetEnumOptions(Type enumType)
    {
        var selectOptions = new List<object>();

        foreach (var enumValue in Enum.GetValues(enumType))
        {
            var enumName = enumValue!.ToString()!;
            var field = enumType.GetField(enumName);
            if (field == null) continue;
            var displayAttr = field.GetCustomAttribute<DisplayAttribute>();

            var enumDisplayName = displayAttr?.Name ?? enumName;
            var enumItemDescription = displayAttr?.Description ?? "";

            selectOptions.Add(new
            {
                label = enumDisplayName,
                value = enumName,
                description = enumItemDescription
            });
        }

        return selectOptions;
    }
}
