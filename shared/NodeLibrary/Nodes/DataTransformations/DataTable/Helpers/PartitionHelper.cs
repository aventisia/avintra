using System.Data;

namespace NodeLibrary.DataTableNodes.Helpers;

/// <summary>
/// Helpers to split rows into partitions based on column values.
/// </summary>
public static class PartitionHelper
{
    /// <summary>
    /// Builds a partition key from the given columns for a row. Uses a unit separator
    /// to avoid collisions. Empty partition columns yields a constant key.
    /// </summary>
    public static string BuildKey(DataRow row, IReadOnlyList<string> partitionColumns)
    {
        if (partitionColumns.Count == 0)
            return "all";
        return string.Join("\u0001", partitionColumns.Select(c => row[c]?.ToString() ?? ""));
    }

    /// <summary>Parses a comma-separated column list into trimmed names.</summary>
    public static List<string> ParseColumns(string? columns)
    {
        if (string.IsNullOrWhiteSpace(columns))
            return new List<string>();
        return columns
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToList();
    }

    /// <summary>Validates that each column exists in the table; throws with a clear message.</summary>
    public static void ValidateColumns(DataTable table, IEnumerable<string> columns)
    {
        foreach (var col in columns)
            if (!table.Columns.Contains(col))
                throw new ArgumentException($"Column '{col}' does not exist in the data table.");
    }
}
