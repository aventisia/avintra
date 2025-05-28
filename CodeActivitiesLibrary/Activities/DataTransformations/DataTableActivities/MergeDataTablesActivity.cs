using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Merge Data Tables"),
         Description(
             "Merges two data tables together, specifying the merging behavior in case their number of columns is different.")]
    public sealed class MergeDataTablesActivity : CodeActivity
    {
        [Category("Input"), DisplayName("First Data Table"), Description("The first data table to merge.")]
        public InArgument<DataTable> FirstDataTable { get; set; }

        [Category("Input"), DisplayName("Second Data Table"), Description("The second data table to merge.")]
        public InArgument<DataTable> SecondDataTable { get; set; }

        [Category("Output"), DisplayName("Merged Data Table"), Description("The merged data table.")]
        public OutArgument<DataTable> MergedDataTable { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var firstDataTable = context.GetValue(FirstDataTable);
            var secondDataTable = context.GetValue(SecondDataTable);

            if (firstDataTable == null || secondDataTable == null)
            {
                context.SetValue(StatusMessage, "Error: One or both data tables are null.");
                return;
            }

            try
            {
                var mergedTable = firstDataTable.Copy();
                foreach (DataRow row in secondDataTable.Rows)
                {
                    mergedTable.Rows.Add(row.ItemArray);
                }

                context.SetValue(MergedDataTable, mergedTable);
                context.SetValue(StatusMessage, "Data tables merged successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}