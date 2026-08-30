using System.Data;

namespace NodeLibrary.ShapingNodes;

[DisplayName("Conditional Split"), Description("Routes each row of a data table into one of several output data tables based on a semicolon-separated list of DataTable row filter expressions. The first matching condition wins per row; rows matching no condition go to a default output.")]
[NodeMetadata(icon: "/assets/Shaping.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class ConditionalSplitNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to route rows from.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Filter Expressions"), Description("Semicolon-separated row filter expressions, e.g. \"Age > 18; Age <= 18\". The first matching condition wins per row.")]
    public required InArgument<string> FilterExpressions { get; set; }

    [DisplayName("Output Names"), Description("Semicolon-separated names for each output data table, e.g. \"Adults;Minors\". Must match the number of filter expressions.")]
    public required InArgument<string> OutputNames { get; set; }

    [DisplayName("Default Output Name"), Description("The name of the output that receives rows matching no condition. Defaults to 'Default'.")]
    public InArgument<string> DefaultOutputName { get; set; } = new InArgument<string>("Default");

    [DisplayName("Outputs"), Description("A dictionary mapping output names to the routed DataTable instances.")]
    public OutArgument<Dictionary<string, DataTable>> Outputs { get; set; } = new OutArgument<Dictionary<string, DataTable>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var filterExpressions = FilterExpressions.Get(context);
            var outputNames = OutputNames.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (string.IsNullOrWhiteSpace(filterExpressions))
                throw new ArgumentException("Filter Expressions cannot be empty.");
            if (string.IsNullOrWhiteSpace(outputNames))
                throw new ArgumentException("Output Names cannot be empty.");

            var filters = filterExpressions.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            var names = outputNames.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            if (names.Count != filters.Count)
                throw new ArgumentException("Output Names must contain the same number of entries as Filter Expressions.");

            var defaultOutputName = DefaultOutputName.Get(context);
            if (string.IsNullOrWhiteSpace(defaultOutputName))
                defaultOutputName = "Default";

            // Validate filters parse.
            foreach (var filter in filters)
            {
                try
                {
                    _ = dataTable.Select(filter);
                }
                catch (System.Data.EvaluateException ex)
                {
                    throw new ArgumentException($"Filter expression '{filter}' is invalid: {ex.Message}");
                }
            }

            var outputs = new Dictionary<string, DataTable>(StringComparer.OrdinalIgnoreCase);
            foreach (var name in names)
                outputs[name] = dataTable.Clone();
            outputs[defaultOutputName] = dataTable.Clone();

            foreach (var row in dataTable.AsEnumerable())
            {
                var routed = false;
                for (var i = 0; i < filters.Count; i++)
                {
                    var matching = dataTable.Select(filters[i]);
                    if (matching.Any(r => r.ItemArray.SequenceEqual(row.ItemArray)))
                    {
                        outputs[names[i]].ImportRow(row);
                        routed = true;
                        break;
                    }
                }
                if (!routed)
                    outputs[defaultOutputName].ImportRow(row);
            }

            Outputs.Set(context, outputs);
            status = $"Successfully routed {dataTable.Rows.Count} rows across {outputs.Count} outputs.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Outputs.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error in conditional split: {ex.Message}");
        }
    }
}
