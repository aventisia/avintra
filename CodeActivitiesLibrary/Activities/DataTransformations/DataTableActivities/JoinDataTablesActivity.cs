using System;
using System.Activities;
using System.ComponentModel;
using System.Data;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Join Data Tables"), Description("Joins two data tables based on the specified join rule.")]
    public sealed class JoinDataTablesActivity : CodeActivity
    {
        [Category("Input"), DisplayName("First Data Table"), Description("The first data table to join.")]
        public InArgument<DataTable> FirstDataTable { get; set; }

        [Category("Input"), DisplayName("Second Data Table"), Description("The second data table to join.")]
        public InArgument<DataTable> SecondDataTable { get; set; }

        [Category("Input"), DisplayName("JoinColumn"), Description("The column name to join on.")]
        public InArgument<string> JoinColumn { get; set; }

        [Category("Output"), DisplayName("Joined Data Table"), Description("The joined data table.")]
        public OutArgument<DataTable> JoinedDataTable { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var firstDataTable = context.GetValue(FirstDataTable);
            var secondDataTable = context.GetValue(SecondDataTable);
            var joinColumn = context.GetValue(JoinColumn);

            if (firstDataTable == null || secondDataTable == null)
            {
                context.SetValue(StatusMessage, "Error: One or both data tables are null.");
                return;
            }

            if (string.IsNullOrEmpty(joinColumn) ||
                !firstDataTable.Columns.Contains(joinColumn) ||
                !secondDataTable.Columns.Contains(joinColumn))
            {
                context.SetValue(StatusMessage, "Error: Invalid join column.");
                return;
            }

            try
            {
                // Perform a full outer join using LINQ
                var query = from row1 in firstDataTable.AsEnumerable()
                            join row2 in secondDataTable.AsEnumerable()
                            on row1[joinColumn] equals row2[joinColumn]
                            into joinedRows
                            from row2 in joinedRows.DefaultIfEmpty()
                            select row1.ItemArray.Concat(row2?.ItemArray ?? new object[0]).ToArray();

                var joinedTable = new DataTable();
                foreach (DataColumn col in firstDataTable.Columns)
                {
                    joinedTable.Columns.Add(col.ColumnName, col.DataType);
                }
                foreach (DataColumn col in secondDataTable.Columns)
                {
                    joinedTable.Columns.Add(col.ColumnName, col.DataType);
                }

                foreach (var row in query)
                {
                    joinedTable.Rows.Add(row);
                }

                context.SetValue(JoinedDataTable, joinedTable);
                context.SetValue(StatusMessage, "Data tables joined successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}