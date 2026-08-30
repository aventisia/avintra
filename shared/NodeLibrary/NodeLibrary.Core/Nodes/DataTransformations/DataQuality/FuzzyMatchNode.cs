using System.Data;

namespace NodeLibrary.DataQualityNodes;

[DisplayName("Fuzzy Match"), Description("Matches rows between a primary data table and a reference data table using fuzzy string similarity on one column each. Outputs the primary rows enriched with the matched reference columns, plus the similarity score.")]
[NodeMetadata(icon: "/assets/DataQuality.svg", badge: "Beta", supportedPlatforms: "cloud")]
public class FuzzyMatchNode : BaseNode
{
    [DisplayName("Primary Data Table"), Description("The data table whose rows are enriched with the best reference match.")]
    public required InArgument<DataTable> PrimaryDataTable { get; set; }

    [DisplayName("Reference Data Table"), Description("The data table used to look up matches.")]
    public required InArgument<DataTable> ReferenceDataTable { get; set; }

    [DisplayName("Primary Match Column"), Description("The column in the primary table to match on.")]
    public required InArgument<string> PrimaryMatchColumn { get; set; }

    [DisplayName("Reference Match Column"), Description("The column in the reference table to match against.")]
    public required InArgument<string> ReferenceMatchColumn { get; set; }

    [DisplayName("Threshold"), Description("The minimum similarity score (0-1) to accept a match. Defaults to 0.7.")]
    public InArgument<decimal> Threshold { get; set; } = new InArgument<decimal>(0.7m);

    [DisplayName("Reference Columns To Include"), Description("Optional comma-separated reference columns to include in the output. Leave empty to include all reference columns except the match column.")]
    public InArgument<string> ReferenceColumnsToInclude { get; set; } = new InArgument<string>();

    [DisplayName("Score Column Name"), Description("The name of the similarity score column. Defaults to 'MatchScore'.")]
    public InArgument<string> ScoreColumnName { get; set; } = new InArgument<string>("MatchScore");

    [DisplayName("Matched Data Table"), Description("The resulting enriched data table. Unmatched rows include the score column set to 0.")]
    public OutArgument<DataTable> MatchedDataTable { get; set; } = new OutArgument<DataTable>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var primaryTable = PrimaryDataTable.Get(context);
            var referenceTable = ReferenceDataTable.Get(context);
            var primaryMatchColumn = PrimaryMatchColumn.Get(context);
            var referenceMatchColumn = ReferenceMatchColumn.Get(context);
            var threshold = Threshold.Get(context);
            var referenceColumnsToInclude = ReferenceColumnsToInclude.Get(context);
            var scoreColumnName = ScoreColumnName.Get(context) ?? string.Empty;

            if (primaryTable == null)
                throw new ArgumentException("Primary Data Table cannot be null.");
            if (referenceTable == null)
                throw new ArgumentException("Reference Data Table cannot be null.");
            if (string.IsNullOrWhiteSpace(primaryMatchColumn) || !primaryTable.Columns.Contains(primaryMatchColumn))
                throw new ArgumentException($"Primary Match Column '{primaryMatchColumn}' does not exist in the primary data table.");
            if (string.IsNullOrWhiteSpace(referenceMatchColumn) || !referenceTable.Columns.Contains(referenceMatchColumn))
                throw new ArgumentException($"Reference Match Column '{referenceMatchColumn}' does not exist in the reference data table.");
            if (threshold < 0m || threshold > 1m)
                throw new ArgumentException("Threshold must be between 0 and 1.");

            // Build the list of reference columns to include.
            List<string> includeCols;
            if (string.IsNullOrWhiteSpace(referenceColumnsToInclude))
            {
                includeCols = referenceTable.Columns.Cast<DataColumn>()
                    .Where(c => !c.ColumnName.Equals(referenceMatchColumn!, StringComparison.OrdinalIgnoreCase))
                    .Select(c => c.ColumnName)
                    .ToList();
            }
            else
            {
                includeCols = referenceColumnsToInclude.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
                foreach (var col in includeCols)
                    if (!referenceTable.Columns.Contains(col))
                        throw new ArgumentException($"Reference column '{col}' does not exist in the reference data table.");
            }

            var result = new DataTable();
            foreach (var col in primaryTable.Columns.Cast<DataColumn>())
                result.Columns.Add(col.ColumnName, col.DataType);
            foreach (var col in includeCols)
                result.Columns.Add($"{col}", referenceTable.Columns[col]!.DataType);
            result.Columns.Add(scoreColumnName, typeof(decimal));

            // Normalize reference rows once.
            var referenceRows = referenceTable.AsEnumerable()
                .Select(r => new
                {
                    Row = r,
                    Key = Normalize(r[referenceMatchColumn]?.ToString())
                })
                .Where(x => !string.IsNullOrEmpty(x.Key))
                .ToList();

            foreach (var primaryRow in primaryTable.AsEnumerable())
            {
                var primaryKey = Normalize(primaryRow[primaryMatchColumn]?.ToString());

                DataRow? bestRef = null;
                decimal bestScore = 0m;

                if (!string.IsNullOrEmpty(primaryKey))
                {
                    foreach (var refRow in referenceRows)
                    {
                        var score = Similarity(primaryKey, refRow.Key);
                        if (score > bestScore)
                        {
                            bestScore = score;
                            bestRef = refRow.Row;
                        }
                    }
                }

                var newRow = result.NewRow();
                foreach (var col in primaryTable.Columns.Cast<DataColumn>())
                    newRow[col.ColumnName] = primaryRow[col.ColumnName];

                var matched = bestRef != null && bestScore >= threshold;
                foreach (var col in includeCols)
                    newRow[col!] = matched ? bestRef![col!] : DBNull.Value;

                newRow[scoreColumnName] = matched ? bestScore : 0m;
                result.Rows.Add(newRow);
            }

            MatchedDataTable.Set(context, result);
            status = $"Successfully matched {result.Rows.Count} rows.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            MatchedDataTable.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error performing fuzzy match: {ex.Message}");
        }
    }

    private static string Normalize(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;
        return System.Text.RegularExpressions.Regex.Replace(value.Trim().ToLowerInvariant(), @"\s+", " ");
    }

    /// <summary>
    /// Computes a similarity score in [0,1] using a combination of Levenshtein and token (Jaccard) similarity.
    /// </summary>
    private static decimal Similarity(string a, string b)
    {
        if (a == b)
            return 1m;

        var lev = 1m - (decimal)Levenshtein(a, b) / Math.Max(a.Length, b.Length);
        var jaccard = Jaccard(a, b);
        return Math.Max(lev, jaccard);
    }

    private static int Levenshtein(string a, string b)
    {
        var dp = new int[a.Length + 1, b.Length + 1];
        for (var i = 0; i <= a.Length; i++) dp[i, 0] = i;
        for (var j = 0; j <= b.Length; j++) dp[0, j] = j;

        for (var i = 1; i <= a.Length; i++)
        {
            for (var j = 1; j <= b.Length; j++)
            {
                var cost = a[i - 1] == b[j - 1] ? 0 : 1;
                dp[i, j] = Math.Min(
                    Math.Min(dp[i - 1, j] + 1, dp[i, j - 1] + 1),
                    dp[i - 1, j - 1] + cost);
            }
        }
        return dp[a.Length, b.Length];
    }

    private static decimal Jaccard(string a, string b)
    {
        var tokensA = a.Split(' ').ToHashSet();
        var tokensB = b.Split(' ').ToHashSet();
        if (tokensA.Count == 0 || tokensB.Count == 0)
            return 0m;
        var intersection = tokensA.Intersect(tokensB).Count();
        var union = tokensA.Union(tokensB).Count();
        return union == 0 ? 0m : (decimal)intersection / union;
    }
}
