namespace NodeLibrary.JsonNodes;

[DisplayName("Delete JSON Node by Primary Key"), Description("Recursively searches for an object with a matching primary key-value pair and deletes it from the structure.")]
[NodeMetadata(icon: "/assets/JSON.svg")]
public class DeleteJSONNodeWithPrimaryKeyNode : BaseNode
{
    [DisplayName("JSON Content"), Description("The root JSON token to begin searching. This can be a JSON string or a JsonNode.")]
    public required InArgument<object> JsonContent { get; set; }

    [DisplayName("Primary Key Name"), Description("The name of the property used to identify the target object (e.g., 'id', 'name').")]
    public required InArgument<string> PrimaryKeyName { get; set; }

    [DisplayName("Primary Key Value"), Description("The value of the primary key used to locate the target object.")]
    public required InArgument<string> PrimaryKeyValue { get; set; }

    [DisplayName("Node Deleted"), Description("Indicates whether a node was successfully deleted (values: 'true', 'false').")]
    public OutArgument<string> NodeDeleted { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "";

        try
        {
            var jsonContent = JsonContent.Get(context);
            var primaryKey = PrimaryKeyName.Get(context);
            var primaryValue = PrimaryKeyValue.Get(context);

            if (jsonContent == null || string.IsNullOrWhiteSpace(primaryKey) || string.IsNullOrWhiteSpace(primaryValue))
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, "Invalid input: JSON Content, Primary Key Name, or Primary Key Value is missing.");
                NodeDeleted.Set(context, "false");
                return;
            }

            var jsonNode = jsonContent is string
                ? JsonNode.Parse((string)jsonContent)
                : (JsonNode)jsonContent;

            var nodeDeleted = DeleteNodeHelper(jsonNode, primaryKey, primaryValue);

            // Set outputs
            NodeDeleted.Set(context, nodeDeleted.ToString().ToLower()); // "true" or "false"
            if (nodeDeleted)
            {
                status = $"Successfully deleted object with '{primaryKey}={primaryValue}'.";
                IsSuccess.Set(context, true);
            }
            else
            {
                status = $"No matching object found with '{primaryKey}={primaryValue}'.";
                IsSuccess.Set(context, true);
            }

            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            NodeDeleted.Set(context, "false");
            StatusMessage.Set(context, $"Error deleting JSON node: {ex.Message}");
        }
    }

    private static bool DeleteNodeHelper(JsonNode token, string primaryKey, string primaryValue)
    {
        if (token?.GetValueKind() == System.Text.Json.JsonValueKind.Object)
        {
            var obj = token.AsObject();
            if (obj.TryGetPropertyValue(primaryKey, out var pkToken))
            {
                var pkStringValue = pkToken?.GetValue<string>();

                if (pkStringValue != null && pkStringValue.Equals(primaryValue, StringComparison.OrdinalIgnoreCase))
                {
                    var parent = token.Parent;
                    if (parent?.GetValueKind() == System.Text.Json.JsonValueKind.Array)
                    {
                        var array = parent.AsArray();
                        for (int i = 0; i < array.Count; i++)
                        {
                            if (array[i] == token)
                            {
                                array.RemoveAt(i);
                                return true;
                            }
                        }
                    }
                    else if (parent?.GetValueKind() == System.Text.Json.JsonValueKind.Object)
                    {
                        var parentObj = parent.AsObject();
                        var keyToRemove = obj.FirstOrDefault(x => x.Value == token).Key;
                        if (keyToRemove != null)
                        {
                            parentObj.Remove(keyToRemove);
                            return true;
                        }
                    }
                }
            }

            foreach (var prop in obj.ToList())
            {
                if (DeleteNodeHelper(prop.Value, primaryKey, primaryValue))
                {
                    return true;
                }
            }
        }
        else if (token?.GetValueKind() == System.Text.Json.JsonValueKind.Array)
        {
            var array = token.AsArray();
            foreach (var item in array.ToList())
            {
                if (DeleteNodeHelper(item, primaryKey, primaryValue))
                {
                    return true;
                }
            }
        }

        return false;
    }
}
