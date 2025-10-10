using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Create Data Table")]
    [Description("Creates a new data table. If an existing data table is provided, it will be cloned.")]
    [ActivityMetaData(nodeImg: "/assets/DataTable.svg")]
    public class CreateDataTableActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------


        [DisplayName("Data Table (Optional)")]
        [Description("An optional input data table to clone or use as a template.")]
        public InArgument<DataTable> DataTable { get; set; }


        [DisplayName("Initial Columns (Optional)")]
        [Description("An optional input to add initial columns in data table.")]
        public InArgument<bool> HasInitialColumns { get; set; }


        [DisplayName("Data Table columns either number or comma seperated columns (Optional)")]
        [Description("An optional input data table columns to add in data table.")]
        [RenderIfCondition(nameof(HasInitialColumns), true)]
        public InArgument<object> Columns { get; set; }


        [DisplayName("Empty Rows (Optional)")]
        [Description("An optional input to add empty rows in data table.")]
        public InArgument<bool> HasEmptyRows { get; set; }


        [DisplayName("Data Table rows (Optional)")]
        [Description("An optional input empty rows to add in data table.")]
        [RenderIfCondition(nameof(HasEmptyRows), true)]
        public InArgument<int> EmptyRows { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("New Data Table")]
        [Description("The newly created or cloned data table.")]
        public OutArgument<DataTable> NewDataTable { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            var columns = Columns.Get(context);
            var hasInitialColumns = HasInitialColumns.Get(context);
            var hasEmptyRows = HasEmptyRows.Get(context);
            var emptyRows = EmptyRows.Get(context);

            DataTable resultTable = null;

            try
            {
                var inputTable = DataTable.Get(context);

                if (inputTable != null)
                {
                    // Clone both schema and data
                    resultTable = inputTable.Copy();
                    status +=
                        $" Cloned input data table with {resultTable.Rows.Count} rows and {resultTable.Columns.Count} columns.";
                }
                else
                {
                    // Create a new empty data table
                    resultTable = new DataTable();

                    if (hasInitialColumns)
                        switch (columns)
                        {
                            case string columnNames:
                                {
                                    // Split the column names by comma and add them
                                    foreach (var colName in columnNames.Split(new[] { ',' },
                                                 StringSplitOptions.RemoveEmptyEntries))
                                        resultTable.Columns.Add(colName.Trim());

                                    break;
                                }
                            case int columnCount:
                                {
                                    // Add specified number of columns with default names
                                    for (var i = 1; i <= columnCount; i++) resultTable.Columns.Add($"Column{i}");

                                    break;
                                }
                            default:
                                throw new ArgumentException(
                                    "Invalid format for Columns input. Use a comma-separated string or an integer.");
                        }

                    if (hasEmptyRows && emptyRows > 0)
                        // Add specified number of empty rows
                        for (var i = 0; i < emptyRows; i++)
                            resultTable.Rows.Add(resultTable.NewRow());

                    status += " Create a new empty data table.";
                }

                NewDataTable.Set(context, resultTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Created a new empty data table");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error creating data table: {ex.Message}");
            }

        }
    }
}