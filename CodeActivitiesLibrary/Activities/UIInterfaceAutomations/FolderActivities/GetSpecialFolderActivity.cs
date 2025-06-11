using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FolderActivities
{
    [DisplayName("Get Special Folder Path")]
    [Description(
        "This activity retrieves the path of a Windows special folder, such as Desktop, My Pictures, Internet Cache, etc.")]
    public class GetSpecialFolderPathActivity : BaseCodeActivity
    {
        [DisplayName("Special Folder Name")]
        [Description("Select the name of the special folder whose path you want to retrieve.")]

        public InArgument<SpecialFolder> SpecialFolderName { get; set; } =
            new InArgument<SpecialFolder>(SpecialFolder.Desktop);

        [DisplayName("Special Folder Path")]
        [Description("The retrieved path of the special folder.")]

        public OutArgument<string> SpecialFolderPath { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input values
            var specialFolderName = context.GetValue(SpecialFolderName);

            try
            {
                // Map the enum value to the corresponding Environment.SpecialFolder
                Environment.SpecialFolder environmentFolder;
                switch (specialFolderName)
                {
                    case SpecialFolder.Desktop:
                        environmentFolder = Environment.SpecialFolder.Desktop;
                        break;
                    case SpecialFolder.Music:
                        environmentFolder = Environment.SpecialFolder.MyMusic;
                        break;
                    case SpecialFolder.Templates:
                        environmentFolder = Environment.SpecialFolder.Templates;
                        break;
                    case SpecialFolder.ApplicationData:
                        environmentFolder = Environment.SpecialFolder.ApplicationData;
                        break;
                    case SpecialFolder.LocalApplicationData:
                        environmentFolder = Environment.SpecialFolder.LocalApplicationData;
                        break;
                    case SpecialFolder.InternetCache:
                        environmentFolder = Environment.SpecialFolder.InternetCache;
                        break;
                    case SpecialFolder.Cookies:
                        environmentFolder = Environment.SpecialFolder.Cookies;
                        break;
                    case SpecialFolder.History:
                        environmentFolder = Environment.SpecialFolder.History;
                        break;
                    default:
                        throw new ArgumentException($"Unsupported special folder: {specialFolderName}");
                }

                // Retrieve the path using Environment.GetFolderPath
                var path = Environment.GetFolderPath(environmentFolder);
                context.SetValue(SpecialFolderPath, path);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"Failed to retrieve the path for the special folder: {specialFolderName}", ex);
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
}