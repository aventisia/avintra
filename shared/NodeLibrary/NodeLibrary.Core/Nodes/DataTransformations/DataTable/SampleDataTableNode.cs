using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Sample Data Table"), Description("Returns a subset of rows from a data table, selected by count or percentage.")]
[NodeMetadata(icon: "/assets/DataTable.svg", badge: "Beta")]
public class SampleDataTableNode : BaseNode
{
    [DisplayName("Data Table"), Description("The data table to sample.")]
    public required InArgument<DataTable> DataTable { get; set; }

    [DisplayName("Sample Mode"), Description("How the rows are selected (first N, last N, percentage, or random N).")]
    public required InArgument<SampleModeEnum> SampleMode { get; set; } = new InArgument<SampleModeEnum>(SampleModeEnum.FirstNRows);

    [DisplayName("Row Count"), Description("The number of rows to keep (used by First N, Last N, and Random N).")]
    public InArgument<int> RowCount { get; set; } = new InArgument<int>(10);

    [DisplayName("Percentage"), Description("The percentage of rows to keep (used by Percentage mode).")]
    public InArgument<double> Percentage { get; set; } = new InArgument<double>(50);

    [DisplayName("Sampled Data Table"), Description("The resulting data table containing the sampled rows.")]
    public OutArgument<DataTable> SampledDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var dataTable = DataTable.Get(context);
            var sampleMode = SampleMode.Get(context);
            var rowCount = RowCount.Get(context);
            var percentage = Percentage.Get(context);

            if (dataTable == null)
                throw new ArgumentException("Data table cannot be null.");
            if (rowCount < 0)
                throw new ArgumentException("Row Count cannot be negative.");
            if (percentage < 0 || percentage > 100)
                throw new ArgumentException("Percentage must be between 0 and 100.");

            var resultTable = dataTable.Clone();
            var rows = dataTable.Rows.Cast<DataRow>().ToList();

            switch (sampleMode)
            {
                case SampleModeEnum.FirstNRows:
                    rows.Take(Math.Min(rowCount, rows.Count)).ToList().ForEach(r => resultTable.ImportRow(r));
                    break;
                case SampleModeEnum.LastNRows:
                    rows.Skip(Math.Max(0, rows.Count - rowCount)).ToList().ForEach(r => resultTable.ImportRow(r));
                    break;
                case SampleModeEnum.Percentage:
                    {
                        var random = new Random();
                        var keep = (int)Math.Round(rows.Count * percentage / 100.0);
                        rows.OrderBy(_ => random.Next()).Take(keep).ToList().ForEach(r => resultTable.ImportRow(r));
                        break;
                    }
                case SampleModeEnum.RandomNRows:
                    {
                        var random = new Random();
                        rows.OrderBy(_ => random.Next()).Take(Math.Min(rowCount, rows.Count)).ToList().ForEach(r => resultTable.ImportRow(r));
                        break;
                    }
                default:
                    throw new ArgumentOutOfRangeException(nameof(sampleMode));
            }

            SampledDataTable.Set(context, resultTable);
            status = $"Successfully sampled data table into {resultTable.Rows.Count} rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            SampledDataTable.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error sampling data table: {ex.Message}");
        }
    }
}
