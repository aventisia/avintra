using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Join Data Tables")]
    [Description("Joins two data tables based on the specified join rule.")]
    public class JoinDataTablesActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("First Data Table")]
        [Description("The first DataTable to be joined.")]
        public InArgument<DataTable> FirstDataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Second Data Table")]
        [Description("The second DataTable to be joined.")]
        public InArgument<DataTable> SecondDataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Join Operation")]
        [Description("Specifies the type of join operation (Inner, Left, Full).")]
        public InArgument<DataTableJoinOperationEnum> JoinOperation { get; set; } =
            new InArgument<DataTableJoinOperationEnum>(DataTableJoinOperationEnum.Inner);

        [RequiredArgument]
        [DisplayName("Join Rules")]
        [Description("Specifies the join condition (e.g., 'FirstTable.ID = SecondTable.ID').")]
        public InArgument<string> JoinRules { get; set; }


        [DisplayName("Joined Data Table")]
        [Description("The resulting DataTable after performing the join operation.")]
        public OutArgument<DataTable> JoinedDataTable { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input values
            var firstDataTable = context.GetValue(FirstDataTable);
            var secondDataTable = context.GetValue(SecondDataTable);
            var joinOperation = context.GetValue(JoinOperation);
            var joinRules = context.GetValue(JoinRules);

            // Validate inputs
            if (firstDataTable == null) throw new ArgumentException("First Data Table cannot be null.");

            if (secondDataTable == null) throw new ArgumentException("Second Data Table cannot be null.");

            if (string.IsNullOrWhiteSpace(joinRules))
                throw new ArgumentException("Join Rules cannot be null or empty.");

            try
            {
                // Perform the join based on the specified operation and rules
                var joinedDataTable = PerformJoin(firstDataTable, secondDataTable, joinOperation, joinRules);

                // Set outputs
                JoinedDataTable.Set(context, joinedDataTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Successfully joined the data tables.");
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
            // Convert DataTables to LINQ queryable objects
            var firstTableQuery = firstDataTable.AsEnumerable().AsQueryable();
            var secondTableQuery = secondDataTable.AsEnumerable().AsQueryable();

            // Parse the join rules to extract column names
            var joinCondition = ParseJoinRules(joinRules);

            // Perform the join based on the specified operation
            IQueryable<DataRow> joinedRows;
            switch (dataTableJoinOperation)
            {
                case DataTableJoinOperationEnum.Inner:
                    joinedRows = PerformInnerJoin(firstTableQuery, secondTableQuery, joinCondition);
                    break;
                case DataTableJoinOperationEnum.Left:
                    joinedRows = PerformLeftJoin(firstTableQuery, secondTableQuery, joinCondition);
                    break;
                case DataTableJoinOperationEnum.Full:
                    joinedRows = PerformFullJoin(firstTableQuery, secondTableQuery, joinCondition);
                    break;
                default:
                    throw new ArgumentException($"Unsupported join operation: {dataTableJoinOperation}");
            }

            // Create a new DataTable with combined columns
            var joinedDataTable = CreateJoinedDataTable(firstDataTable, secondDataTable);

            // Add rows to the joined DataTable
            foreach (var row in joinedRows) joinedDataTable.Rows.Add(row.ItemArray);

            return joinedDataTable;
        }

        private static Dictionary<string, string> ParseJoinRules(string joinRules)
        {
            // Example join rule: "FirstTable.ID = SecondTable.ID"
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

        private static IQueryable<DataRow> PerformInnerJoin(IQueryable<DataRow> firstTable,
            IQueryable<DataRow> secondTable, Dictionary<string, string> joinCondition)
        {
            return from firstRow in firstTable
                   join secondRow in secondTable
                       on firstRow[joinCondition["FirstColumn"]] equals secondRow[joinCondition["SecondColumn"]]
                   select firstRow;
        }

        private static IQueryable<DataRow> PerformLeftJoin(IQueryable<DataRow> firstTable,
            IQueryable<DataRow> secondTable, Dictionary<string, string> joinCondition)
        {
            return from firstRow in firstTable
                   join secondRow in secondTable
                       on firstRow[joinCondition["FirstColumn"]] equals secondRow[joinCondition["SecondColumn"]]
                       into joinedRows
                   from secondRow in joinedRows.DefaultIfEmpty()
                   select firstRow;
        }

        private static IQueryable<DataRow> PerformFullJoin(IQueryable<DataRow> firstTable,
            IQueryable<DataRow> secondTable, Dictionary<string, string> joinCondition)
        {
            return from firstRow in firstTable
                   join secondRow in secondTable
                       on firstRow[joinCondition["FirstColumn"]] equals secondRow[joinCondition["SecondColumn"]]
                       into joinedRows
                   from secondRow in joinedRows.DefaultIfEmpty()
                   select firstRow;
        }

        private static DataTable CreateJoinedDataTable(DataTable firstDataTable, DataTable secondDataTable)
        {
            // Create a new DataTable with combined columns
            var joinedDataTable = new DataTable("JoinedDataTable");

            // Add columns from the first table
            foreach (DataColumn col in firstDataTable.Columns)
                joinedDataTable.Columns.Add(col.ColumnName, col.DataType);

            // Add columns from the second table with a prefix to avoid conflicts
            foreach (DataColumn col in secondDataTable.Columns)
                joinedDataTable.Columns.Add($"Second_{col.ColumnName}", col.DataType);

            return joinedDataTable;
        }
    }
}