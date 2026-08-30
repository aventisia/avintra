namespace NodeLibrary.FileNodes;

[DisplayName("Write Text to File"), Description("Writes the given text to the specified file using either Replace or Append mode.")]
[NodeMetadata(icon: "/assets/File.svg")]
public class WriteTextToFileNode : BaseNode
{
    #region Arguments

    [DisplayName("File Path"), Description("The full file path where the text should be written.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Text to Write"), Description("The text content to write to the file.")]
    public required InArgument<string> TextToWrite { get; set; }


    [DisplayName("Write Mode"), Description("Specifies the write mode: Append (default) or Overwrite.")]
    public InArgument<WriteModeEnum> WriteMode { get; set; } = new InArgument<WriteModeEnum>(WriteModeEnum.Append);

    #endregion

    protected override void Execute(INodeContext context)
    {
        var filePath = FilePath.Get(context);
        var text = TextToWrite.Get(context);
        var writeMode = WriteMode.Get(context);

        var status = "";

        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("FilePath cannot be empty.");

            if (string.IsNullOrWhiteSpace(text))
                throw new ArgumentException("Text cannot be empty.");

            var dir = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                Directory.CreateDirectory(dir); // auto-create directories

            if (writeMode == WriteModeEnum.Append)
            {
                File.AppendAllText(filePath, text + Environment.NewLine);
                status = $"Text appended to file at {filePath}";
            }
            else
            {
                File.WriteAllText(filePath, text + Environment.NewLine);
                status = $"Text overwritten (replaced) to file at {filePath}";
            }
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }
}

public enum WriteModeEnum
{
    [Display(Name = "Append", Description = "Add to file content")]
    Append,

    [Display(Name = "Overwrite", Description = "Replace file content")]
    Overwrite
}
