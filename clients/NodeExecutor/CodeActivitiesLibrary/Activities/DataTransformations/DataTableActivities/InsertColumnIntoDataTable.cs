using CodeActivitiesLibrary.DataTransformations.DataTableActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities
{
    [DisplayName("Insert Column Into Data Table")]
    [Description("Inserts a new column into the data table either at the end or before a specific column index.")]
    [ActivityMetaData(nodeImg: "/assets/DataTable.svg")]
    public sealed class InsertColumnIntoDataTable : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Data Table")]
        public InArgument<DataTable> DataTable { get; set; }

        [RequiredArgument]
        [DisplayName("Column Name")]
        public InArgument<string> ColumnName { get; set; }

        [RequiredArgument]
        [DisplayName("Data Type")]
        [Description("Data type of the new column (e.g., String, Int, Decimal, etc).")]
        public InArgument<DataTableColumnTypeEnum> DataType { get; set; }

        [DisplayName("Insert Location")]
        [DefaultValue(DataTableInsertLocationEnum.EndOfDataTable)]
        public InArgument<DataTableInsertLocationEnum> InsertLocation { get; set; }

        [DisplayName("Column Index")]
        [Description("Index to insert column at (used only if 'Before Column Index').")]
        [RenderIfCondition(nameof(InsertLocation), DataTableInsertLocationEnum.BeforeColumnIndex)]
        public InArgument<int> ColumnIndex { get; set; }

        [DisplayName("Modified Data Table")]
        public OutArgument<DataTable> ModifiedDataTable { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var dataTable = DataTable.Get(context);
                var columnName = ColumnName.Get(context);
                var dataTypeEnum = DataType.Get(context);
                var insertLocation = InsertLocation.Expression != null
                    ? InsertLocation.Get(context)
                    : DataTableInsertLocationEnum.EndOfDataTable;

                if (dataTable == null)
                    throw new ArgumentException("Input DataTable cannot be null.");

                if (string.IsNullOrWhiteSpace(columnName))
                    throw new ArgumentException("Column name cannot be empty or whitespace.");

                if (dataTable.Columns.Contains(columnName))
                    throw new ArgumentException($"A column with name '{columnName}' already exists.");

                Type resolvedType = ResolveType(dataTypeEnum);
                var newColumn = new DataColumn(columnName, resolvedType);

                if (insertLocation == DataTableInsertLocationEnum.EndOfDataTable)
                {
                    dataTable.Columns.Add(newColumn);
                }
                else if (insertLocation == DataTableInsertLocationEnum.BeforeColumnIndex)
                {
                    var index = ColumnIndex.Get(context);
                    if (index < 0 || index > dataTable.Columns.Count)
                        throw new ArgumentOutOfRangeException(nameof(index), $"Column index must be between 0 and {dataTable.Columns.Count}.");

                    dataTable.Columns.Add(newColumn);
                    newColumn.SetOrdinal(index);
                }

                ModifiedDataTable.Set(context, dataTable);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully inserted column '{columnName}' of type '{resolvedType.Name}'.");
            }
            catch (Exception ex)
            {
                ModifiedDataTable.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error inserting column: {ex.Message}");
            }
        }

        private Type ResolveType(DataTableColumnTypeEnum enumValue)
        {
            switch (enumValue)
            {
                case DataTableColumnTypeEnum.String:
                    return typeof(string);
                case DataTableColumnTypeEnum.Int:
                    return typeof(int);
                case DataTableColumnTypeEnum.Double:
                    return typeof(double);
                case DataTableColumnTypeEnum.Decimal:
                    return typeof(decimal);
                case DataTableColumnTypeEnum.Float:
                    return typeof(float);
                case DataTableColumnTypeEnum.DateTime:
                    return typeof(DateTime);
                case DataTableColumnTypeEnum.Boolean:
                    return typeof(bool);
                default:
                    return typeof(string);
            }
        }
        public enum DataTableColumnTypeEnum
        {
            [Display(Name = "String", Description = "Represents a string (text) value.")]
            String,

            [Display(Name = "Integer", Description = "Represents an integer (whole number) value.")]
            Int,

            [Display(Name = "Double", Description = "Represents a double-precision floating-point number.")]
            Double,

            [Display(Name = "Decimal", Description = "Represents a high-precision decimal number, typically used for financial calculations.")]
            Decimal,

            [Display(Name = "Float", Description = "Represents a single-precision floating-point number.")]
            Float,

            [Display(Name = "DateTime", Description = "Represents a date and time value.")]
            DateTime,

            [Display(Name = "Boolean", Description = "Represents a true or false logical value.")]
            Boolean
        }
    }
}
