using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Find and Replace in Data Table"), Description("Finds and/or replaces data table values.")]
    public sealed class FindAndReplaceInDataTableActivity : CodeActivity
    {
        [Category("Input"), DisplayName("Data Table"), Description("The data table to process.")]
        public InArgument<DataTable> DataTable { get; set; }

        [Category("Input"), DisplayName("FindValue"), Description("The value to find.")]
        public InArgument<object> FindValue { get; set; }

        [Category("Input"), DisplayName("ReplaceValue"), Description("The value to replace with.")]
        public InArgument<object> ReplaceValue { get; set; }

        [Category("Output"), DisplayName("Status Message"), Description("Returns the result status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var dataTable = context.GetValue(DataTable);
            var findValue = context.GetValue(FindValue);
            var replaceValue = context.GetValue(ReplaceValue);

            if (dataTable == null)
            {
                context.SetValue(StatusMessage, "Error: Data table is null.");
                return;
            }

            try
            {
                foreach (DataRow row in dataTable.Rows)
                {
                    foreach (DataColumn column in dataTable.Columns)
                    {
                        if (row[column] != null && row[column].Equals(findValue))
                        {
                            row[column] = replaceValue;
                        }
                    }
                }

                context.SetValue(StatusMessage, "Find and replace completed successfully.");
            }
            catch (Exception ex)
            {
                context.SetValue(StatusMessage, $"Error: {ex.Message}");
            }
        }
    }
}