namespace NodeLibrary.ExcelNodes.Helpers;

/// <summary>
/// Shared helpers for converting between Excel column letters and 1-based column indexes.
/// </summary>
public static class ExcelColumnHelper
{
    /// <summary>
    /// Converts a column letter (e.g., "A", "AA") to its 1-based index (e.g., 1, 27).
    /// Throws if the input is empty or contains non-letter characters.
    /// </summary>
    public static int GetColumnIndex(string columnName)
    {
        if (string.IsNullOrWhiteSpace(columnName))
            throw new ArgumentException("Column name cannot be empty.", nameof(columnName));

        columnName = columnName.Trim().ToUpperInvariant();

        int index = 0;
        foreach (char c in columnName)
        {
            if (c < 'A' || c > 'Z')
                throw new ArgumentException($"Invalid column name '{columnName}'. Column must contain only letters A-Z.", nameof(columnName));

            index = index * 26 + (c - 'A') + 1;
        }

        return index;
    }

    /// <summary>
    /// Converts a 1-based column index (e.g., 1, 27) to its column letter (e.g., "A", "AA").
    /// Throws if the index is less than 1.
    /// </summary>
    public static string GetColumnLetter(int columnIndex)
    {
        if (columnIndex < 1)
            throw new ArgumentOutOfRangeException(nameof(columnIndex), "Column index must be >= 1.");

        string result = string.Empty;
        while (columnIndex > 0)
        {
            columnIndex--;
            result = (char)('A' + columnIndex % 26) + result;
            columnIndex /= 26;
        }

        return result;
    }
}
