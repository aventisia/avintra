using NodeLibrary.FileNodes.Enums;

namespace NodeLibrary.FileNodes;

[DisplayName("Rename File(s)"), Description("Renames one or more files with advanced schemes including datetime and sequential numbering.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class RenameFileNode : BaseNode
{
    [DisplayName("File(s) to rename"), Description("The path(s) of the file(s) to rename. Supports wildcards like *.txt.")]
    public required InArgument<string> FilesToRename { get; set; }

    [DisplayName("Rename scheme"), Description("Specifies the rename scheme to apply.")]
    public required InArgument<RenameSchemeEnum> RenameScheme { get; set; } = new InArgument<RenameSchemeEnum>(RenameSchemeEnum.SetNewName);

    [DisplayName("Keep extension"), Description("Indicates whether to keep the original file extension.")]
    public required InArgument<bool> KeepExtension { get; set; }

    [DisplayName("If file exists"), Description("Specifies the behavior when a file already exists in the destination folder.")]
    public required InArgument<IfExistsActionEnum> IfExistsAction { get; set; } = new InArgument<IfExistsActionEnum>(IfExistsActionEnum.DoNothing);

    [DisplayName("New file name"), Description("The new name for the file(s). Required for 'Set new name'.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.SetNewName)]
    public InArgument<string> NewFileName { get; set; }

    [DisplayName("Text to add"), Description("The text to append or prepend to the filename.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddText)]
    public InArgument<string> TextToAdd { get; set; }

    [DisplayName("Add text position"), Description("Where to add the text: before or after the filename.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddText)]
    public InArgument<AddTextPositionEnum> AddTextPosition { get; set; } = new InArgument<AddTextPositionEnum>(AddTextPositionEnum.AfterName);

    [DisplayName("Text to remove"), Description("The text to remove from the filename.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.RemoveText)]
    public InArgument<string> TextToRemove { get; set; }

    [DisplayName("Text to replace"), Description("The text to be replaced in the filename.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.ReplaceText)]
    public InArgument<string> TextToReplace { get; set; }

    [DisplayName("Replace with"), Description("The replacement text for the matched string.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.ReplaceText)]
    public InArgument<string> ReplaceWith { get; set; }

    [DisplayName("New extension"), Description("The new file extension (e.g., .pdf). Must include the dot (.).")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.ChangeExtension)]
    public InArgument<string> NewExtension { get; set; }

    [DisplayName("Add datetime"), Description("Appends a timestamp to the file name.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddDateTime)]
    public InArgument<bool> UseCustomDateTime { get; set; } // Toggle custom date

    [DisplayName("Datetime source"), Description("Choose between current system time or a custom datetime value.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddDateTime)]
    [RenderIfCondition(nameof(UseCustomDateTime), true)]
    public InArgument<DatetimeSourceEnum> DatetimeSource { get; set; } = new InArgument<DatetimeSourceEnum>(DatetimeSourceEnum.CurrentDateTime);

    [DisplayName("Add datetime position"), Description("Where to place the datetime: before or after the filename.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddDateTime)]
    public InArgument<AddTextPositionEnum> AddDateTimePosition { get; set; } = new InArgument<AddTextPositionEnum>(AddTextPositionEnum.AfterName);

    [DisplayName("Separator"), Description("Character used to separate filename from datetime (e.g., '_', '-', '.').")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddDateTime)]
    public InArgument<SeparatorEnum> DateTimeSeparator { get; set; } = new InArgument<SeparatorEnum>(SeparatorEnum.Underscore);

    [DisplayName("Datetime format"), Description("Custom format for the datetime (e.g., yyyyMMdd_HHmmss). Leave empty for default.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.AddDateTime)]
    public InArgument<string> DateTimeFormat { get; set; } = new InArgument<string>("yyyyMMdd_HHmmss");

    // Make Sequential (Advanced)
    [DisplayName("Make sequential"), Description("Renames files with sequential numbers (e.g., File_001, File_002).")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<string> BaseFileName { get; set; }

    [DisplayName("Add number position"), Description("Where to place the sequential number: before or after the base name.")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<AddTextPositionEnum> AddNumberPosition { get; set; } = new InArgument<AddTextPositionEnum>(AddTextPositionEnum.AfterName);

    [DisplayName("Start numbering at"), Description("The first number in the sequence (e.g., 1).")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<int> StartNumber { get; set; } = new InArgument<int>(1);

    [DisplayName("Increment by"), Description("How much to increase the number for each subsequent file (e.g., 1, 5).")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<int> IncrementBy { get; set; } = new InArgument<int>(1);

    [DisplayName("Number separator"), Description("Character used to separate filename from number (e.g., '_', '-', space).")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<SeparatorEnum> NumberSeparator { get; set; } = new InArgument<SeparatorEnum>(SeparatorEnum.Underscore);

    [DisplayName("Use padding"), Description("Whether to pad numbers with leading zeros (e.g., 001, 010).")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    public InArgument<bool> UsePadding { get; set; } = new InArgument<bool>(false);

    [DisplayName("Minimum digits"), Description("Minimum number of digits for padded numbers (e.g., 3 → 001, 002).")]
    [RenderIfCondition(nameof(RenameScheme), RenameSchemeEnum.MakeSequential)]
    [RenderIfCondition(nameof(UsePadding), true)]
    public InArgument<int> MinDigits { get; set; } = new InArgument<int>(3);

    [DisplayName("Renamed Files"), Description("Returns the list of successfully renamed files.")]
    public OutArgument<List<string>> RenamedFiles { get; set; } = new OutArgument<List<string>>();

    protected override void Execute(INodeContext context)
    {
        var filesToRename = FilesToRename.Get(context);
        var renameScheme = RenameScheme.Get(context);
        var ifExistsAction = IfExistsAction.Get(context);
        var keepExtension = KeepExtension.Get(context);

        if (string.IsNullOrWhiteSpace(filesToRename))
        {
            throw new ArgumentException("Files to rename cannot be empty.");
        }

        try
        {
            var filePatterns = filesToRename.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);
            var renamedFiles = new List<string>();

            foreach (var pattern in filePatterns)
            {
                var expandedPaths = GetExpandedPaths(pattern);

                foreach (var filePath in expandedPaths)
                {
                    if (!File.Exists(filePath))
                        continue;

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
                            default:
                                throw new ArgumentException("Invalid 'If file exists' action specified.");
                        }
                    }

                    File.Move(filePath, newFilePath);
                    renamedFiles.Add(newFilePath);
                }
            }

            RenamedFiles.Set(context, renamedFiles);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, $"Successfully renamed {renamedFiles.Count} file(s).");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error renaming files: {ex.Message}");
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
                return Path.Combine(dir, $"{newFileName}{(keepExtension ? extension : "")}");

            case RenameSchemeEnum.AddText:
                var pos = addTextPosition ?? AddTextPositionEnum.AfterName;
                var addedText = pos == AddTextPositionEnum.BeforeName
                    ? $"{textToAdd}_{fileName}"
                    : $"{fileName}_{textToAdd}";
                return Path.Combine(dir, $"{addedText}{(keepExtension ? extension : "")}");

            case RenameSchemeEnum.RemoveText:
                var removed = fileName.Replace(textToRemove, "");
                return Path.Combine(dir, $"{removed}{(keepExtension ? extension : "")}");

            case RenameSchemeEnum.ReplaceText:
                var replaced = fileName.Replace(textToReplace, replaceWith);
                return Path.Combine(dir, $"{replaced}{(keepExtension ? extension : "")}");

            case RenameSchemeEnum.ChangeExtension:
                if (string.IsNullOrWhiteSpace(newExtension))
                    throw new ArgumentException("New extension cannot be empty when changing extension.");
                if (!newExtension.StartsWith("."))
                    newExtension = "." + newExtension;
                return Path.Combine(dir, $"{fileName}{newExtension}");

            case RenameSchemeEnum.AddDateTime:
                var dt = useCustomDateTime == true && datetimeSource == DatetimeSourceEnum.CustomDateTime
                    ? DateTime.Now
                    : DateTime.Now;

                var format = string.IsNullOrWhiteSpace(dateTimeFormat) ? "yyyyMMdd_HHmmss" : dateTimeFormat;
                var formattedDate = dt.ToString(format);

                // C# 7.3 compatible separator mapping
                string sep;
                switch (dateTimeSeparator)
                {
                    case SeparatorEnum.Period:
                        sep = ".";
                        break;
                    case SeparatorEnum.Underscore:
                        sep = "_";
                        break;
                    case SeparatorEnum.Dash:
                        sep = "-";
                        break;
                    case SeparatorEnum.Space:
                        sep = " ";
                        break;
                    default:
                        sep = "_";
                        break;
                }

                var position = addDateTimePosition ?? AddTextPositionEnum.AfterName;
                var result = position == AddTextPositionEnum.BeforeName
                    ? $"{formattedDate}{sep}{fileName}"
                    : $"{fileName}{sep}{formattedDate}";

                return Path.Combine(dir, $"{result}{(keepExtension ? extension : "")}");

            case RenameSchemeEnum.MakeSequential:
                var counter = startNumber ?? 1;
                var increment = incrementBy ?? 1;
                var baseName = string.IsNullOrWhiteSpace(baseFileName) ? fileName : baseFileName;

                // C# 7.3 compatible separator mapping
                string numSep;
                switch (numberSeparator)
                {
                    case SeparatorEnum.Period:
                        numSep = ".";
                        break;
                    case SeparatorEnum.Underscore:
                        numSep = "_";
                        break;
                    case SeparatorEnum.Dash:
                        numSep = "-";
                        break;
                    case SeparatorEnum.Space:
                        numSep = " ";
                        break;
                    default:
                        numSep = "_";
                        break;
                }

                var positionNum = addNumberPosition ?? AddTextPositionEnum.AfterName;
                var padding = usePadding == true && minDigits.HasValue ? minDigits.Value : 0;

                while (true)
                {
                    string numberStr;
                    if (padding > 0)
                    {
                        numberStr = counter.ToString($"D{padding}");
                    }
                    else
                    {
                        numberStr = counter.ToString();
                    }

                    var newName = positionNum == AddTextPositionEnum.BeforeName
                        ? $"{numberStr}{numSep}{baseName}"
                        : $"{baseName}{numSep}{numberStr}";

                    var fullPath = Path.Combine(dir, $"{newName}{(keepExtension ? extension : "")}");

                    if (!File.Exists(fullPath))
                    {
                        return fullPath;
                    }

                    counter += increment;
                }

            default:
                throw new ArgumentException("Invalid rename scheme specified.");
        }
    }

    private IEnumerable<string> GetExpandedPaths(string pattern)
    {
        var dir = Path.GetDirectoryName(pattern);
        var name = Path.GetFileName(pattern);
        return Directory.GetFiles(dir, name);
    }
}

public enum RenameSchemeEnum
{
    [Display(Name = "Set new name", Description = "Sets a completely new name for the file.")]
    SetNewName,

    [Display(Name = "Add text", Description = "Adds text to the existing file name.")]
    AddText,

    [Display(Name = "Remove text", Description = "Removes specified text from the file name.")]
    RemoveText,

    [Display(Name = "Replace text", Description = "Replaces specified text in the file name.")]
    ReplaceText,

    [Display(Name = "Change extension", Description = "Changes the file extension.")]
    ChangeExtension,

    [Display(Name = "Add datetime", Description = "Appends a timestamp to the file name.")]
    AddDateTime,

    [Display(Name = "Make sequential", Description = "Renames the file with a sequential number.")]
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

