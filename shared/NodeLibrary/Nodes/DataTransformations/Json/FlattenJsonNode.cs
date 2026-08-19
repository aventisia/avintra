using System.Text.Json.Nodes;

namespace NodeLibrary.JsonNodes;

[DisplayName("Flatten JSON"), Description("Flattens a nested JSON structure into a single-level object whose keys represent the full path to each leaf value.")]
[NodeMetadata(icon: "/assets/JSON.svg", badge: "Beta")]
public class FlattenJsonNode : BaseNode
{
    [DisplayName("JSON Node"), Description("The JSON node or object to flatten.")]
    public required InArgument<JsonNode> JsonNode { get; set; }

    [DisplayName("Separator"), Description("The separator used between path segments. Defaults to '.'.")]
    public InArgument<string> Separator { get; set; } = new InArgument<string>(".");

    [DisplayName("Flattened JSON"), Description("The flattened JSON object as a string.")]
    public OutArgument<string> FlattenedJson { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var jsonNode = JsonNode.Get(context);
            var separator = Separator.Get(context);

            if (jsonNode == null)
                throw new ArgumentException("JSON node cannot be null.");
            var sep = string.IsNullOrWhiteSpace(separator) ? "." : separator;

            var flat = new JsonObject();
            Flatten(jsonNode, "", sep, flat);

            FlattenedJson.Set(context, flat.ToJsonString());
            status = "Successfully flattened JSON.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            FlattenedJson.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error flattening JSON: {ex.Message}");
        }
    }

    private static void Flatten(JsonNode? node, string prefix, string separator, JsonObject output)
    {
        if (node == null)
        {
            output[prefix] = null;
            return;
        }

        if (node is JsonObject obj)
        {
            if (obj.Count == 0)
            {
                output[prefix] = new JsonObject();
                return;
            }
            foreach (var prop in obj)
            {
                var key = string.IsNullOrEmpty(prefix) ? prop.Key : prefix + separator + prop.Key;
                Flatten(prop.Value, key, separator, output);
            }
        }
        else if (node is JsonArray array)
        {
            if (array.Count == 0)
            {
                output[prefix] = new JsonArray();
                return;
            }
            for (var i = 0; i < array.Count; i++)
            {
                var key = string.IsNullOrEmpty(prefix) ? i.ToString() : prefix + separator + i;
                Flatten(array[i], key, separator, output);
            }
        }
        else
        {
            output[prefix] = node.DeepClone();
        }
    }
}
