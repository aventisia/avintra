namespace NodeLibrary.JsonNodes;

[DisplayName("Insert or Update JSON Node by Primary Key"), Description("Searches recursively through a JSON structure to find an object where a primary key matches a given value. If found, inserts or updates a specified key-value pair.")]
[NodeMetadata(icon: "/assets/JSON.svg")]
public class InsertOrUpdateJSONNodeWithPrimaryKeyNode : BaseNode
{
    [DisplayName("JSON Content"), Description("The root JSON token to begin searching. This can be a JSON string or a JsonNode.")]
    public required InArgument<object> JsonContent { get; set; }

    [DisplayName("Primary Key Name"), Description("The name of the property used to identify the target object (e.g., 'id', 'name').")]
    public required InArgument<string> PrimaryKeyName { get; set; }

    [DisplayName("Primary Key Value"), Description("The value of the primary key used to locate the target object.")]
    public required InArgument<string> PrimaryKeyValue { get; set; }

    [DisplayName("Target Key Name"), Description("The name of the key to insert or update in the matched object.")]
    public required InArgument<string> TargetKeyName { get; set; }

    [DisplayName("Target Key Value"), Description("The value to assign to the target key in the matched object.")]
    public required InArgument<object> TargetKeyValue { get; set; }

    [DisplayName("Updated JSON Content"), Description("The updated JSON content after inserting or updating the node.")]
    public OutArgument<JsonNode> UpdatedJsonContent { get; set; } = new OutArgument<JsonNode>();

    protected override void Execute(INodeContext context)
    {
        var status = "";

        try
        {
            // Get input values
            var jsonInput = JsonContent.Get(context);
            var primaryKey = PrimaryKeyName.Get(context);
            var primaryValue = PrimaryKeyValue.Get(context)?.Trim();
            var targetKey = TargetKeyName.Get(context);
            var targetValue = TargetKeyValue.Get(context);

            if (jsonInput == null || string.IsNullOrWhiteSpace(primaryKey) || string.IsNullOrWhiteSpace(primaryValue))
            {
                SetError(context, "JSON Content, Primary Key Name, or Primary Key Value is missing.");
                return;
            }

            // Convert to JsonNode
            JsonNode jsonToken;
            if (jsonInput is string jsonString)
            {
                jsonToken = JsonNode.Parse(jsonString);
            }
            else if (jsonInput is JsonNode jn)
            {
                jsonToken = jn;
            }
            else
            {
                SetError(context, "Unsupported JSON Content type. Please provide string or JsonNode.");
                return;
            }

            // Convert value to JsonNode
            var options = new System.Text.Json.JsonSerializerOptions { WriteIndented = false };
            var jsonStr = System.Text.Json.JsonSerializer.Serialize(targetValue, options);
            var jTargetValue = JsonNode.Parse(jsonStr);

            // Perform recursive update
            var isUpdated = UpdateNode(jsonToken, primaryKey, primaryValue, targetKey, jTargetValue);

            // Set result
            UpdatedJsonContent.Set(context, jsonToken);
            if (isUpdated)
            {
                status = $"Updated '{targetKey}' for matching node where {primaryKey} = {primaryValue}.";
                IsSuccess.Set(context, true);
            }
            else
            {
                status = $"No matching object found with {primaryKey} = {primaryValue}.";
                IsSuccess.Set(context, false);
            }

            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            SetError(context, $"Error occurred: {ex.Message}");
        }
    }

    private static bool UpdateNode(JsonNode token, string primaryKey, string primaryValue, string targetKey, JsonNode targetValue)
    {
        return token?.GetValueKind() switch
        {
            System.Text.Json.JsonValueKind.Array => UpdateNodeInArray(token, primaryKey, primaryValue, targetKey, targetValue),
            System.Text.Json.JsonValueKind.Object => UpdateNodeInObject(token, primaryKey, primaryValue, targetKey, targetValue),
            _ => false
        };
    }

    private static bool UpdateNodeInArray(JsonNode token, string primaryKey, string primaryValue, string targetKey, JsonNode targetValue)
    {
        var array = token?.AsArray();
        if (array != null)
        {
            foreach (var item in array)
            {
                if (UpdateNode(item, primaryKey, primaryValue, targetKey, targetValue))
                    return true;
            }
        }
        return false;
    }

    private static bool UpdateNodeInObject(JsonNode token, string primaryKey, string primaryValue, string targetKey, JsonNode targetValue)
    {
        var obj = token?.AsObject();
        if (obj == null)
            return false;

        if (obj.TryGetPropertyValue(primaryKey, out var pkToken))
        {
            var tokenVal = pkToken?.ToJsonString()?.Trim()?.Trim('"');
            if (string.Equals(tokenVal, primaryValue, StringComparison.OrdinalIgnoreCase))
            {
                obj[targetKey] = targetValue;
                return true;
            }
        }

        // Recurse into all properties
        foreach (var prop in obj)
        {
            if (UpdateNode(prop.Value, primaryKey, primaryValue, targetKey, targetValue))
                return true;
        }

        return false;
    }

    private void SetError(INodeContext context, string message)
    {
        UpdatedJsonContent.Set(context, null!);
        IsSuccess.Set(context, false);
        StatusMessage.Set(context, message);
    }
}
