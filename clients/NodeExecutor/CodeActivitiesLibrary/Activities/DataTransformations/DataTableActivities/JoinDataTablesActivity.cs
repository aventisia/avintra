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
    [ActivityMetaData(nodeImg: "/assets/DataTable.svg")]
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
            // Perform left join first
            PerformLeftJoin(joinedDataTable, firstDataTable, secondDataTable, joinCondition);

            // Add unmatched rows from the second table
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
