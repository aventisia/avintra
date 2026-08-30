using NodeLibrary.FileNodes.Enums;

namespace NodeLibrary.FileNodes;

[DisplayName("Rename File(s)"), Description("Renames one or more files using various schemes: set new name, add/remove/replace text, change extension, add datetime stamp, or sequential numbering. Supports wildcard patterns and multiple paths separated by semicolons.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class RenameFileNode : BaseNode
{
    [DisplayName("Source file path(s)"), Description("One or more file paths to rename, separated by semicolons. Supports wildcards (e.g., 'C:\\Data\\*.txt;C:\\Logs\\report_*.csv').")]
    public required InArgument<string> FilesToRename { get; set; }

    [DisplayName("Rename scheme"), Description("The renaming strategy to apply. Default: Set new name.")]
    public required InArgument<RenameSchemeEnum> RenameScheme { get; set; } = new InArgument<RenameSchemeEnum>(RenameSchemeEnum.SetNewName);

    [DisplayName("Keep original extension"), Description("When true, preserves the original file extension regardless of the rename scheme. Default: false.")]
    public required InArgument<bool> KeepExtension { get; set; }

    [DisplayName("If file exists"), Description("Action to take when the target filename already exists. Default: Do nothing (skip).")]
    public required InArgument<IfExistsActionEnum> IfExistsAction { get; set; } = new InArgument<IfExistsActionEnum>(IfExistsActionEnum.DoNothing);

    [DisplayName("New file name"), Description("The new name for the file (without extension if 'Keep original extension' is true). Example: 'monthly_report'.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.SetNewName)]
    public InArgument<string> NewFileName { get; set; } = new InArgument<string>();

    [DisplayName("Text to add"), Description("The text to prepend or append to the existing filename. Example: '_backup'.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddText)]
    public InArgument<string> TextToAdd { get; set; }

    [DisplayName("Text position"), Description("Whether to insert the text before or after the filename. Default: After name.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddText)]
    public InArgument<AddTextPositionEnum> AddTextPosition { get; set; } = new InArgument<AddTextPositionEnum>(AddTextPositionEnum.AfterName);

    [DisplayName("Text to remove"), Description("The exact text to remove from the filename. Example: '_draft' removes '_draft' from 'report_draft.txt'.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.RemoveText)]
    public InArgument<string> TextToRemove { get; set; } = new InArgument<string>();

    [DisplayName("Text to find"), Description("The exact text in the filename to be replaced. Example: 'old' in 'old_report.txt'.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.ReplaceText)]
    public InArgument<string> TextToReplace { get; set; }

    [DisplayName("Replace with"), Description("The replacement text. Example: 'new' replaces 'old' → 'new_report.txt'.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.ReplaceText)]
    public InArgument<string> ReplaceWith { get; set; }

    [DisplayName("New extension"), Description("The new file extension including the leading dot. Example: '.pdf', '.bak'.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.ChangeExtension)]
    public InArgument<string> NewExtension { get; set; }

    [DisplayName("Use custom datetime"), Description("When true, allows selecting a custom datetime source instead of the current system time.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddDateTime)]
    public InArgument<bool> UseCustomDateTime { get; set; } = new InArgument<bool>(false);

    [DisplayName("Datetime source"), Description("Choose between current system time or a custom datetime value. Default: Current datetime.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddDateTime)]
    [RenderIfCondition(nameof(UseCustomDateTime), true)]
    public InArgument<DatetimeSourceEnum> DatetimeSource { get; set; } = new InArgument<DatetimeSourceEnum>(DatetimeSourceEnum.CurrentDateTime);

    [DisplayName("Datetime position"), Description("Whether to place the datetime stamp before or after the filename. Default: After name.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddDateTime)]
    public InArgument<AddTextPositionEnum> AddDateTimePosition { get; set; } = new InArgument<AddTextPositionEnum>(AddTextPositionEnum.AfterName);

    [DisplayName("Datetime separator"), Description("Character placed between the filename and datetime stamp. Default: Underscore (_).")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddDateTime)]
    public InArgument<SeparatorEnum> DateTimeSeparator { get; set; } = new InArgument<SeparatorEnum>(SeparatorEnum.Underscore);

    [DisplayName("Datetime format"), Description("The .NET datetime format string. Examples: 'yyyyMMdd_HHmmss' → '20250520_143022', 'yyyy-MM-dd' → '2025-05-20'. Default: 'yyyyMMdd_HHmmss'.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddDateTime)]
    public InArgument<string> DateTimeFormat { get; set; } = new InArgument<string>("yyyyMMdd_HHmmss");

    [DisplayName("Base file name"), Description("The base name used for sequential renaming. If empty, the original filename is used. Example: 'Invoice'.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<string> BaseFileName { get; set; } = new InArgument<string>();

    [DisplayName("Number position"), Description("Whether to place the sequential number before or after the base name. Default: After name.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<AddTextPositionEnum> AddNumberPosition { get; set; } = new InArgument<AddTextPositionEnum>(AddTextPositionEnum.AfterName);

    [DisplayName("Start number"), Description("The first number in the sequence. Default: 1.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<int> StartNumber { get; set; } = new InArgument<int>(1);

    [DisplayName("Increment by"), Description("The step value between sequential numbers. Example: 5 produces 1, 6, 11, etc. Default: 1.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<int> IncrementBy { get; set; } = new InArgument<int>(1);

    [DisplayName("Number separator"), Description("Character placed between the base name and sequential number. Default: Underscore (_).")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<SeparatorEnum> NumberSeparator { get; set; } = new InArgument<SeparatorEnum>(SeparatorEnum.Underscore);

    [DisplayName("Pad with zeros"), Description("When true, pads the sequential number with leading zeros (e.g., 001, 002). Default: false.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<bool> UsePadding { get; set; } = new InArgument<bool>(false);

    [DisplayName("Minimum digits"), Description("The minimum number of digits when zero-padding is enabled (e.g., 3 → 001, 002). Default: 3.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    [RenderIfCondition(nameof(UsePadding), true)]
    public InArgument<int> MinDigits { get; set; } = new InArgument<int>(3);

    [DisplayName("Renamed files"), Description("Returns the list of new full paths of all successfully renamed files.")]
    public OutArgument<List<string>> RenamedFiles { get; set; } = new OutArgument<List<string>>();

    protected override void Execute(INodeContext context)
    {
        var filesToRename = FilesToRename.Get(context);
        var renameScheme = RenameScheme.Get(context);
        var ifExistsAction = IfExistsAction.Get(context);
        var keepExtension = KeepExtension.Get(context);

        if (string.IsNullOrWhiteSpace(filesToRename))
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, "Source file path(s) cannot be empty.");
            return;
        }

        try
        {
            var filePatterns = filesToRename.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
            var renamedFiles = new List<string>();

            foreach (var pattern in filePatterns)
            {
                var trimmedPattern = pattern.Trim();
                var dir = Path.GetDirectoryName(trimmedPattern);
                var filePattern = Path.GetFileName(trimmedPattern);

                if (string.IsNullOrEmpty(dir) || !Directory.Exists(dir))
                    continue;

                foreach (var filePath in Directory.EnumerateFiles(dir, filePattern))
                {
                    var newFilePath = ApplyRenameScheme(
                        filePath,
                        renameScheme,
                        NewFileName?.Get(context),
                        TextToAdd?.Get(context),
                        AddTextPosition?.Get(context),
                        TextToRemove?.Get(context),
                        TextToReplace?.Get(context),
                        ReplaceWith?.Get(context),
                        NewExtension?.Get(context),
                        keepExtension,
                        UseCustomDateTime?.Get(context),
                        DatetimeSource?.Get(context),
                        AddDateTimePosition?.Get(context),
                        DateTimeSeparator?.Get(context),
                        DateTimeFormat?.Get(context),
                        BaseFileName?.Get(context),
                        AddNumberPosition?.Get(context),
                        StartNumber?.Get(context),
                        IncrementBy?.Get(context),
                        NumberSeparator?.Get(context),
                        UsePadding?.Get(context),
                        MinDigits?.Get(context)
                    );

                    if (File.Exists(newFilePath))
                    {
                        switch (ifExistsAction)
                        {
                            case IfExistsActionEnum.DoNothing:
                                continue;
                            case IfExistsActionEnum.Overwrite:
                                File.Delete(newFilePath);
                                break;
                        }
                    }

                    File.Move(filePath, newFilePath);
                    renamedFiles.Add(newFilePath);
                }
            }

            RenamedFiles.Set(context, renamedFiles);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"{renamedFiles.Count} file(s) renamed successfully.");
        }
        catch (UnauthorizedAccessException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Access denied: {ex.Message}");
        }
        catch (IOException ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"I/O error renaming files: {ex.Message}");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error renaming files: {ex.Message}");
        }
    }

    private static string GetSeparatorString(SeparatorEnum? separator)
    {
        switch (separator)
        {
            case SeparatorEnum.Period: return ".";
            case SeparatorEnum.Underscore: return "_";
            case SeparatorEnum.Dash: return "-";
            case SeparatorEnum.Space: return " ";
            default: return "_";
        }
    }

    private string ApplyRenameScheme(
        string filePath,
        RenameSchemeEnum renameScheme,
        string newFileName,
        string textToAdd,
        AddTextPositionEnum? addTextPosition,
        string textToRemove,
        string textToReplace,
        string replaceWith,
        string newExtension,
        bool keepExtension,
        bool? useCustomDateTime,
        DatetimeSourceEnum? datetimeSource,
        AddTextPositionEnum? addDateTimePosition,
        SeparatorEnum? dateTimeSeparator,
        string dateTimeFormat,
        string baseFileName,
        AddTextPositionEnum? addNumberPosition,
        int? startNumber,
        int? incrementBy,
        SeparatorEnum? numberSeparator,
        bool? usePadding,
        int? minDigits)
    {
        var fileName = Path.GetFileNameWithoutExtension(filePath);
        var extension = Path.GetExtension(filePath);
        var dir = Path.GetDirectoryName(filePath);

        switch (renameScheme)
        {
            case RenameSchemeEnum.SetNewName:
                if (string.IsNullOrWhiteSpace(newFileName))
                    throw new ArgumentException("New file name is required for 'Set new name' scheme.");
                return Path.Combine(dir, $"{newFileName}{(keepExtension ? extension : "")}");

            case RenameSchemeEnum.AddText:
                if (string.IsNullOrEmpty(textToAdd))
                    throw new ArgumentException("Text to add cannot be empty for 'Add text' scheme.");
                var pos = addTextPosition ?? AddTextPositionEnum.AfterName;
                var addedText = pos == AddTextPositionEnum.BeforeName
                    ? $"{textToAdd}_{fileName}"
                    : $"{fileName}_{textToAdd}";
                return Path.Combine(dir, $"{addedText}{(keepExtension ? extension : "")}");

            case RenameSchemeEnum.RemoveText:
                if (string.IsNullOrEmpty(textToRemove))
                    throw new ArgumentException("Text to remove cannot be empty for 'Remove text' scheme.");
                var removed = fileName.Replace(textToRemove, "");
                return Path.Combine(dir, $"{removed}{(keepExtension ? extension : "")}");

            case RenameSchemeEnum.ReplaceText:
                if (string.IsNullOrEmpty(textToReplace))
                    throw new ArgumentException("Text to find cannot be empty for 'Replace text' scheme.");
                var replaced = fileName.Replace(textToReplace, replaceWith ?? "");
                return Path.Combine(dir, $"{replaced}{(keepExtension ? extension : "")}");

            case RenameSchemeEnum.ChangeExtension:
                if (string.IsNullOrWhiteSpace(newExtension))
                    throw new ArgumentException("New extension cannot be empty for 'Change extension' scheme.");
                if (!newExtension.StartsWith("."))
                    newExtension = "." + newExtension;
                return Path.Combine(dir, $"{fileName}{newExtension}");

            case RenameSchemeEnum.AddDateTime:
                var dt = DateTime.Now;
                var format = string.IsNullOrWhiteSpace(dateTimeFormat) ? "yyyyMMdd_HHmmss" : dateTimeFormat;
                var formattedDate = dt.ToString(format);
                var sep = GetSeparatorString(dateTimeSeparator);
                var dtPosition = addDateTimePosition ?? AddTextPositionEnum.AfterName;
                var dtResult = dtPosition == AddTextPositionEnum.BeforeName
                    ? $"{formattedDate}{sep}{fileName}"
                    : $"{fileName}{sep}{formattedDate}";
                return Path.Combine(dir, $"{dtResult}{(keepExtension ? extension : "")}");

            case RenameSchemeEnum.MakeSequential:
                var counter = startNumber ?? 1;
                var increment = incrementBy ?? 1;
                var baseName = string.IsNullOrWhiteSpace(baseFileName) ? fileName : baseFileName;
                var numSep = GetSeparatorString(numberSeparator);
                var positionNum = addNumberPosition ?? AddTextPositionEnum.AfterName;
                var padding = usePadding == true && minDigits.HasValue ? minDigits.Value : 0;

                while (true)
                {
                    var numberStr = padding > 0
                        ? counter.ToString($"D{padding}")
                        : counter.ToString();

                    var newName = positionNum == AddTextPositionEnum.BeforeName
                        ? $"{numberStr}{numSep}{baseName}"
                        : $"{baseName}{numSep}{numberStr}";

                    var fullPath = Path.Combine(dir, $"{newName}{(keepExtension ? extension : "")}");

                    if (!File.Exists(fullPath))
                        return fullPath;

                    counter += increment;
                }

            default:
                throw new ArgumentException($"Unsupported rename scheme: {renameScheme}");
        }
    }
}

public enum RenameSchemeEnum
{
    [Display(Name = "Set new name", Description = "Sets a completely new name for the file.")]
    SetNewName,

    [Display(Name = "Add text", Description = "Prepends or appends text to the existing filename.")]
    AddText,

    [Display(Name = "Remove text", Description = "Removes a specified substring from the filename.")]
    RemoveText,

    [Display(Name = "Replace text", Description = "Replaces a specified substring in the filename with new text.")]
    ReplaceText,

    [Display(Name = "Change extension", Description = "Changes the file extension to a new value.")]
    ChangeExtension,

    [Display(Name = "Add datetime", Description = "Appends or prepends a formatted timestamp to the filename.")]
    AddDateTime,

    [Display(Name = "Make sequential", Description = "Renames files with sequential numbers (e.g., Invoice_001, Invoice_002).")]
    MakeSequential,
}

public enum AddTextPositionEnum
{
    [Display(Name = "Before name", Description = "Inserts text before the filename.")]
    BeforeName,

    [Display(Name = "After name", Description = "Inserts text after the filename.")]
    AfterName,
}

public enum SeparatorEnum
{
    [Display(Name = "Period (.)", Description = "Uses '.' as separator.")]
    Period,

    [Display(Name = "Underscore (_)", Description = "Uses '_' as separator.")]
    Underscore,

    [Display(Name = "Dash (-)", Description = "Uses '-' as separator.")]
    Dash,

    [Display(Name = "Space ( )", Description = "Uses space as separator.")]
    Space,
}

public enum DatetimeSourceEnum
{
    [Display(Name = "Current datetime", Description = "Uses the current system datetime.")]
    CurrentDateTime,

    [Display(Name = "Custom datetime", Description = "Uses a custom datetime value (not yet implemented).")]
    CustomDateTime,
}

