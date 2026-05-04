namespace NodeLibrary.VariablesNodes;

[DisplayName("Parse Fragmented JSON List"), Description("Converts a list of JSON string fragments (e.g., from Add Item to List) into a list of proper objects.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class ParseFragmentedJsonListNode : BaseNode
{
    [DisplayName("Fragmented List"), Description("The list containing JSON fragments like \"{prop:\\\"value\\\"}\".")]
    public required InArgument<List<object>> FragmentedList { get; set; }

    [DisplayName("Parsed List"), Description("The reconstructed list of objects ready for sorting.")]
    public OutArgument<List<object>> ParsedList { get; set; } = new OutArgument<List<object>>();

    protected override void Execute(INodeContext context)
    {
        try
        {
            var inputList = FragmentedList.Get(context);

            if (inputList == null || !inputList.Any())
            {
                ParsedList.Set(context, new List<object>());
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Input list is empty.");
                return;
            }

            if (!inputList.All(item => item is string))
                throw new ArgumentException("All items in the input list must be strings.");

            var stringList = inputList.Cast<string>().ToList();
            var reconstructed = ReconstructObjectsFromFragments(stringList);

            ParsedList.Set(context, reconstructed.Cast<object>().ToList());
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully parsed {reconstructed.Count} object(s).");
        }
        catch (Exception ex)
        {
            ParsedList.Set(context, new List<object>());
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error parsing fragmented JSON list: {ex.Message}");
        }
    }

    private List<Dictionary<string, object>> ReconstructObjectsFromFragments(List<string> fragments)
    {
        var objects = new List<Dictionary<string, object>>();
        var currentLines = new List<string>();

        foreach (var fragment in fragments)
        {
            var clean = fragment.Trim().Trim('"');

            if (currentLines.Count > 0)
            {
                string lastLine = currentLines[currentLines.Count - 1];
                if (lastLine.EndsWith("}"))
                {
                    TryBuildObject(currentLines, objects);
                    currentLines.Clear();
                }
            }

            clean = clean.TrimStart('{').TrimEnd('}').Trim();
            if (!string.IsNullOrEmpty(clean))
                currentLines.Add(clean);

            if (fragment.Contains("}"))
            {
                if (currentLines.Count > 0)
                {
                    TryBuildObject(currentLines, objects);
                    currentLines.Clear();
                }
            }
        }

        if (currentLines.Count > 0)
            TryBuildObject(currentLines, objects);

        return objects;
    }

    private void TryBuildObject(List<string> lines, List<Dictionary<string, object>> target)
    {
        try
        {
            string json = "{" + string.Join(",", lines) + "}";
            var obj = JsonSerializer.Deserialize<Dictionary<string, object>>(json);
            if (obj != null)
                target.Add(obj);
        }
        catch
        {
            // Skip invalid fragments
        }
    }
}
