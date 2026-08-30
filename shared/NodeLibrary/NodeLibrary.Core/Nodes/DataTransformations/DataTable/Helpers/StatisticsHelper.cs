namespace NodeLibrary.DataTableNodes.Helpers;

/// <summary>
/// Shared statistical helpers for aggregation, windowing, and data-quality nodes.
/// All methods operate on sequences of objects (cell values) and return object? results.
/// </summary>
public static class StatisticsHelper
{
    /// <summary>Converts a sequence of cell values to decimals, skipping null/DBNull and non-numeric values.</summary>
    public static List<decimal> ToDecimals(IEnumerable<object?> values)
    {
        var result = new List<decimal>();
        foreach (var v in values)
        {
            if (v == null || v is DBNull)
                continue;
            try
            {
                result.Add(Convert.ToDecimal(v, CultureInfo.InvariantCulture));
            }
            catch
            {
                // skip non-numeric values
            }
        }
        return result;
    }

    /// <summary>Converts a sequence of cell values to strings, skipping null/DBNull.</summary>
    public static List<string> ToStrings(IEnumerable<object?> values)
    {
        var result = new List<string>();
        foreach (var v in values)
        {
            if (v == null || v is DBNull)
                continue;
            var s = Convert.ToString(v, CultureInfo.InvariantCulture);
            if (s != null)
                result.Add(s);
        }
        return result;
    }

    public static decimal? Mode(IEnumerable<object?> values)
    {
        var strings = ToStrings(values);
        if (strings.Count == 0)
            return null;
        var mode = strings.GroupBy(s => s, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(g => g.Count())
            .ThenBy(g => g.Key, StringComparer.OrdinalIgnoreCase)
            .First().Key;
        return decimal.TryParse(mode, NumberStyles.Any, CultureInfo.InvariantCulture, out var d) ? d : (decimal?)null;
    }

    public static decimal? Percentile(IEnumerable<object?> values, decimal percentile)
    {
        var decimals = ToDecimals(values);
        if (decimals.Count == 0)
            return null;
        if (percentile < 0) percentile = 0;
        if (percentile > 100) percentile = 100;
        decimals.Sort();
        var rank = (percentile / 100m) * (decimals.Count - 1);
        var lower = (int)Math.Floor(rank);
        var upper = (int)Math.Ceiling(rank);
        if (lower == upper)
            return decimals[lower];
        var fraction = rank - lower;
        return decimals[lower] + (decimals[upper] - decimals[lower]) * fraction;
    }

    public static decimal? WeightedAverage(IEnumerable<object?> values, IEnumerable<object?> weights)
    {
        var vals = ToDecimals(values);
        var wts = ToDecimals(weights);
        if (vals.Count == 0 || wts.Count == 0 || vals.Count != wts.Count)
            return null;
        var weightSum = wts.Sum();
        if (weightSum == 0m)
            return null;
        decimal acc = 0m;
        for (var i = 0; i < vals.Count; i++)
            acc += vals[i] * wts[i];
        return acc / weightSum;
    }

    public static decimal? GeometricMean(IEnumerable<object?> values)
    {
        var decimals = ToDecimals(values);
        if (decimals.Count == 0 || decimals.Any(d => d <= 0))
            return null;
        var logSum = decimals.Sum(d => (double)Math.Log((double)d));
        return (decimal?)Math.Exp(logSum / decimals.Count);
    }

    public static decimal? HarmonicMean(IEnumerable<object?> values)
    {
        var decimals = ToDecimals(values);
        if (decimals.Count == 0 || decimals.Any(d => d == 0m))
            return null;
        var reciprocalSum = decimals.Sum(d => 1.0 / (double)d);
        return (decimal?)(decimals.Count / reciprocalSum);
    }

    public static decimal? Variance(IEnumerable<object?> values, bool sample)
    {
        var decimals = ToDecimals(values);
        return Variance(decimals, sample);
    }

    public static decimal? Variance(IEnumerable<decimal> values, bool sample)
    {
        var decimals = values.ToList();
        if (decimals.Count == 0)
            return null;
        if (sample && decimals.Count < 2)
            return null;
        var avg = decimals.Average();
        var sumSquares = decimals.Sum(d => (d - avg) * (d - avg));
        return sumSquares / (sample ? decimals.Count - 1 : decimals.Count);
    }

    public static decimal? StandardDeviation(IEnumerable<object?> values, bool sample)
    {
        var variance = Variance(values, sample);
        return variance.HasValue ? (decimal?)Math.Sqrt((double)variance.Value) : null;
    }

    public static decimal? StandardDeviation(IEnumerable<decimal> values, bool sample)
    {
        var variance = Variance(values, sample);
        return variance.HasValue ? (decimal?)Math.Sqrt((double)variance.Value) : null;
    }

    public static decimal? Skewness(IEnumerable<object?> values)
    {
        var decimals = ToDecimals(values);
        return Skewness(decimals);
    }

    public static decimal? Skewness(IEnumerable<decimal> values)
    {
        var decimals = values.ToList();
        if (decimals.Count < 3)
            return null;
        var avg = decimals.Average();
        var sd = StandardDeviation(decimals, sample: true);
        if (!sd.HasValue || sd.Value == 0m)
            return null;
        var n = (decimal)decimals.Count;
        var cubed = decimals.Sum(d => (d - avg) * (d - avg) * (d - avg));
        return (n / ((n - 1m) * (n - 2m))) * (cubed / (sd.Value * sd.Value * sd.Value));
    }

    public static decimal? Kurtosis(IEnumerable<object?> values)
    {
        var decimals = ToDecimals(values);
        return Kurtosis(decimals);
    }

    public static decimal? Kurtosis(IEnumerable<decimal> values)
    {
        var decimals = values.ToList();
        if (decimals.Count < 4)
            return null;
        var avg = decimals.Average();
        var sd = StandardDeviation(decimals, sample: true);
        if (!sd.HasValue || sd.Value == 0m)
            return null;
        var n = (decimal)decimals.Count;
        var fourth = decimals.Sum(d => (d - avg) * (d - avg) * (d - avg) * (d - avg));
        var sd4 = sd.Value * sd.Value * sd.Value * sd.Value;
        var kurt = (n * (n + 1m) * fourth) / ((n - 1m) * (n - 2m) * (n - 3m) * sd4);
        var adjustment = (3m * (n - 1m) * (n - 1m)) / ((n - 2m) * (n - 3m));
        return kurt - adjustment; // excess kurtosis
    }
}
