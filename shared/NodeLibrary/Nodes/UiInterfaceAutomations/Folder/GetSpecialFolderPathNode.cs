namespace NodeLibrary.FolderNodes;

[DisplayName("Get Special Folder Path"), Description("This activity retrieves the path of a Windows special folder, such as Desktop, My Pictures, Internet Cache, etc.")]
[NodeMetadata(icon: "/assets/Folder.svg")]
public class GetSpecialFolderPathNode : BaseNode
{
    [DisplayName("Special Folder Name"), Description("Select the name of the special folder whose path you want to retrieve.")]
    public InArgument<SpecialFolder> SpecialFolderName { get; set; } = new InArgument<SpecialFolder>(SpecialFolder.Desktop);

    [DisplayName("Special Folder Path"), Description("The retrieved path of the special folder.")]
    public OutArgument<string> SpecialFolderPath { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var specialFolderName = SpecialFolderName.Get(context);

            Environment.SpecialFolder environmentFolder = specialFolderName switch
            {
                SpecialFolder.Desktop => Environment.SpecialFolder.Desktop,
                SpecialFolder.Music => Environment.SpecialFolder.MyMusic,
                SpecialFolder.Templates => Environment.SpecialFolder.Templates,
                SpecialFolder.ApplicationData => Environment.SpecialFolder.ApplicationData,
                SpecialFolder.LocalApplicationData => Environment.SpecialFolder.LocalApplicationData,
                SpecialFolder.InternetCache => Environment.SpecialFolder.InternetCache,
                SpecialFolder.Cookies => Environment.SpecialFolder.Cookies,
                SpecialFolder.History => Environment.SpecialFolder.History,
                _ => throw new ArgumentException($"Unsupported special folder: {specialFolderName}")
            };

            var path = Environment.GetFolderPath(environmentFolder);
            SpecialFolderPath.Set(context, path);
            status = $"Successfully retrieved the path for {specialFolderName}: {path}";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Failed to retrieve the path for the special folder: {ex.Message}");
        }
    }

    public enum SpecialFolder
    {
        [Description("The desktop directory for the current user.")]
        Desktop,

        [Description("The directory containing music files.")]
        Music,

        [Description("The directory containing template files.")]
        Templates,

        [Description("The directory containing application data for all users.")]
        ApplicationData,

        [Description("The directory containing application data for the current user.")]
        LocalApplicationData,

        [Description("The directory containing Internet cache files.")]
        InternetCache,

        [Description("The directory containing cookies.")]
        Cookies,

        [Description("The directory containing browsing history.")]
        History
    }
}