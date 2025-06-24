using System.Data;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.DataTableActivities.Helpers
{
    public static class DataTableHelper
    {
        public static DataRow[] CaseSensitiveSelect(this DataTable table, string filterExpression, bool matchCase)
        {
            if (!matchCase)
                return table.Select(filterExpression);

            // Case-sensitive filter using LINQ
            var rows = table.AsEnumerable()
                .Where(row =>
                {
                    // Build a DataView for expression evaluation
                    var view = new DataView(table)
                    {
                        RowFilter = filterExpression
                    };
                    // Check if this row matches the filter in a case-insensitive way
                    return view.ToTable().AsEnumerable().Any(r => r.ItemArray.SequenceEqual(row.ItemArray));
                })
                .ToArray();

            return rows;
        }
    }
}