namespace NodeLibrary.DataTableNodes.Helpers;

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

    public static DataRow[] CaseSensitiveSelectMethod(DataTable table, string filterExpression, bool matchCase)
    {
        if (table == null)
            throw new ArgumentNullException(nameof(table));
        if (string.IsNullOrWhiteSpace(filterExpression))
            throw new ArgumentException("Filter expression cannot be empty.", nameof(filterExpression));

        if (!matchCase)
            return table.Select(filterExpression);

        // Use case-sensitive comparison by temporarily setting CaseSensitive = true
        var originalCaseSensitivity = table.CaseSensitive;
        try
        {
            table.CaseSensitive = true;
            return table.Select(filterExpression);
        }
        finally
        {
            table.CaseSensitive = originalCaseSensitivity;
        }
    }
}
