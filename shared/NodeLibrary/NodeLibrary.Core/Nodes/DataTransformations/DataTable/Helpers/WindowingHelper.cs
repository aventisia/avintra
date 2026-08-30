namespace NodeLibrary.DataTableNodes.Helpers;

/// <summary>
/// Helpers for windowing nodes that operate over ordered rows within partitions.
/// </summary>
public static class WindowingHelper
{
    /// <summary>
    /// Normalizes a cell value to a comparable object. Numeric strings become decimals so that
    /// ordering is numeric; otherwise falls back to a string.
    /// </summary>
    public static object NormalizeForOrder(object? value)
    {
        if (value == null || value is DBNull)
            return string.Empty;
        if (decimal.TryParse(Convert.ToString(value, CultureInfo.InvariantCulture), NumberStyles.Any, CultureInfo.InvariantCulture, out var d))
            return d;
        return Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty;
    }

    /// <summary>
    /// Compares two normalized values for ordering. Both should be either decimal or string.
    /// </summary>
    public static int CompareNormalized(object? x, object? y)
    {
        if (x is decimal dx && y is decimal dy)
            return dx.CompareTo(dy);
        return string.Compare(Convert.ToString(x, CultureInfo.InvariantCulture), Convert.ToString(y, CultureInfo.InvariantCulture), StringComparison.Ordinal);
    }
}
