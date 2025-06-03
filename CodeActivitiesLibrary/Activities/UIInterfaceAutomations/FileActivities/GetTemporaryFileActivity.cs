using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{

    [DisplayName("Get Temporary File")]
    [Description("Creates a uniquely named empty temporary file on disk and returns its FileInfo object.")]
    public class GetTemporaryFileActivity : Extensions.BaseCodeActivity
    {

        [DisplayName("Temporary File")]
        [Description("The FileInfo object representing the temporary file created on disk.")]
        public OutArgument<FileInfo> TempFile { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Generate a unique temporary file path
            string tempFilePath = Path.GetTempFileName();

            // Create the FileInfo object to represent the file
            FileInfo fileInfo = new FileInfo(tempFilePath);

            // Set the output
            TempFile.Set(context, fileInfo);
        }
    }
}
