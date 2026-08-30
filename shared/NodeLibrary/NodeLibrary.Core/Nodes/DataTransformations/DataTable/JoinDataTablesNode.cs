using System.Data;
using NodeLibrary.DataTableNodes.Enums;

namespace NodeLibrary.DataTableNodes;

[DisplayName("Join Data Tables"), Description("Joins two data tables based on the specified join rule.")]
[NodeMetadata(icon: "/assets/DataTable.svg")]
public class JoinDataTablesNode : BaseNode
{
    [DisplayName("First Data Table"), Description("The first DataTable to be joined.")]
    public required InArgument<DataTable> FirstDataTable { get; set; }

    [DisplayName("Second Data Table"), Description("The second DataTable to be joined.")]
    public required InArgument<DataTable> SecondDataTable { get; set; }

    [DisplayName("Join Operation"), Description("Specifies the type of join operation (Inner, Left, Full).")]
    public required InArgument<DataTableJoinOperationEnum> JoinOperation { get; set; } = new InArgument<DataTableJoinOperationEnum>(DataTableJoinOperationEnum.Inner);

    [DisplayName("Join Rules"), Description("Specifies the join condition (e.g., 'FirstTable.ID = SecondTable.ID').")]
    public required InArgument<string> JoinRules { get; set; }

    [DisplayName("Joined Data Table"), Description("The resulting DataTable after performing the join operation.")]
    public OutArgument<DataTable> JoinedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            // Retrieve input values
            var firstDataTable = FirstDataTable.Get(context);
            var secondDataTable = SecondDataTable.Get(context);
            var joinOperation = JoinOperation.Get(context);
            var joinRules = JoinRules.Get(context);

            // Validate inputs
            if (firstDataTable == null)
                throw new ArgumentException("First Data Table cannot be null.");

            if (secondDataTable == null)
                throw new ArgumentException("Second Data Table cannot be null.");

            if (string.IsNullOrWhiteSpace(joinRules))
                throw new ArgumentException("Join Rules cannot be null or empty.");

            // Perform the join based on the specified operation and rules
            var joinedDataTable = PerformJoin(firstDataTable, secondDataTable, joinOperation, joinRules);

            // Set outputs
            JoinedDataTable.Set(context, joinedDataTable);
            status = "Successfully joined the data tables.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            JoinedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Failed to join data tables: {ex.Message}");
        }
    }

    private DataTable PerformJoin(DataTable firstDataTable, DataTable secondDataTable,
        DataTableJoinOperationEnum dataTableJoinOperation, string joinRules)
    {
        // Parse the join rules to extract column names
        var joinCondition = ParseJoinRules(joinRules);

        // Create a new DataTable with combined columns
        var joinedDataTable = CreateJoinedDataTable(firstDataTable, secondDataTable);

        // Perform the join based on the specified operation
        switch (dataTableJoinOperation)
        {
            case DataTableJoinOperationEnum.Inner:
                PerformInnerJoin(joinedDataTable, firstDataTable, secondDataTable, joinCondition);
                break;
            case DataTableJoinOperationEnum.Left:
                PerformLeftJoin(joinedDataTable, firstDataTable, secondDataTable, joinCondition);
                break;
            case DataTableJoinOperationEnum.Full:
                PerformFullJoin(joinedDataTable, firstDataTable, secondDataTable, joinCondition);
                break;
            default:
                throw new ArgumentException($"Unsupported join operation: {dataTableJoinOperation}");
        }

        return joinedDataTable;
    }

    private static Dictionary<string, string> ParseJoinRules(string joinRules)
    {
        var parts = joinRules.Split('=');
        if (parts.Length != 2)
            throw new FormatException(
                "Invalid join rule format. Expected format: 'FirstTable.ColumnName = SecondTable.ColumnName'");

        var firstColumn = parts[0].Trim();
        var secondColumn = parts[1].Trim();

        return new Dictionary<string, string>
        {
            { "FirstColumn", firstColumn },
            { "SecondColumn", secondColumn }
        };
    }

    private static void PerformInnerJoin(DataTable joinedDataTable, DataTable firstDataTable, DataTable secondDataTable, Dictionary<string, string> joinCondition)
    {
        foreach (DataRow firstRow in firstDataTable.Rows)
        {
            var matchingRows = secondDataTable.AsEnumerable()
                .Where(row => row[joinCondition["SecondColumn"]].Equals(firstRow[joinCondition["FirstColumn"]]));

            foreach (var secondRow in matchingRows)
            {
                var newRow = joinedDataTable.NewRow();
                CopyRowValues(newRow, firstRow, firstDataTable.Columns);
                CopyRowValues(newRow, secondRow, secondDataTable.Columns, prefix: "Second_");
                joinedDataTable.Rows.Add(newRow);
            }
        }
    }

    private static void PerformLeftJoin(DataTable joinedDataTable, DataTable firstDataTable, DataTable secondDataTable, Dictionary<string, string> joinCondition)
    {
        foreach (DataRow firstRow in firstDataTable.Rows)
        {
            var matchingRows = secondDataTable.AsEnumerable()
                .Where(row => row[joinCondition["SecondColumn"]].Equals(firstRow[joinCondition["FirstColumn"]]));

            if (!matchingRows.Any())
            {
                var newRow = joinedDataTable.NewRow();
                CopyRowValues(newRow, firstRow, firstDataTable.Columns);
                joinedDataTable.Rows.Add(newRow);
            }
            else
            {
                foreach (var secondRow in matchingRows)
                {
                    var newRow = joinedDataTable.NewRow();
                    CopyRowValues(newRow, firstRow, firstDataTable.Columns);
                    CopyRowValues(newRow, secondRow, secondDataTable.Columns, prefix: "Second_");
                    joinedDataTable.Rows.Add(newRow);
                }
            }
        }
    }

    private static void PerformFullJoin(DataTable joinedDataTable, DataTable firstDataTable, DataTable secondDataTable, Dictionary<string, string> joinCondition)
    {
        PerformLeftJoin(joinedDataTable, firstDataTable, secondDataTable, joinCondition);

        var matchedKeys = new HashSet<object>();
        foreach (DataRow row in joinedDataTable.Rows)
        {
            var key = row[joinCondition["FirstColumn"]];
            if (key != DBNull.Value)
                matchedKeys.Add(key);
        }

        foreach (DataRow secondRow in secondDataTable.Rows)
        {
            if (!matchedKeys.Contains(secondRow[joinCondition["SecondColumn"]]))
            {
                var newRow = joinedDataTable.NewRow();
                CopyRowValues(newRow, secondRow, secondDataTable.Columns, prefix: "Second_");
                joinedDataTable.Rows.Add(newRow);
            }
        }
    }

    private static void CopyRowValues(DataRow targetRow, DataRow sourceRow, DataColumnCollection sourceColumns, string prefix = "")
    {
        foreach (DataColumn col in sourceColumns)
        {
            var targetColumnName = prefix + col.ColumnName;
            if (targetRow.Table.Columns.Contains(targetColumnName))
                targetRow[targetColumnName] = sourceRow[col];
        }
    }

    private static DataTable CreateJoinedDataTable(DataTable firstDataTable, DataTable secondDataTable)
    {
        var joinedDataTable = new DataTable("JoinedDataTable");

        foreach (DataColumn col in firstDataTable.Columns)
            joinedDataTable.Columns.Add(col.ColumnName, col.DataType);

        foreach (DataColumn col in secondDataTable.Columns)
            joinedDataTable.Columns.Add($"Second_{col.ColumnName}", col.DataType);

        return joinedDataTable;
    }
}
