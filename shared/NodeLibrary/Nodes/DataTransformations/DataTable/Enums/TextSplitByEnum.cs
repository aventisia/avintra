namespace NodeLibrary.DataTableNodes.Enums;

/// <summary>
/// Determines how a source column is split into multiple columns.
/// </summary>
public enum TextSplitByEnum
{
    [Display(Name = "Delimiter", Description = "Splits the text on a specified delimiter.")]
    Delimiter = 0,

    [Display(Name = "Fixed Length", Description = "Splits the text into fixed-length chunks.")]
    FixedLength = 1
}
