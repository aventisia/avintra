using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("If File Exists")]
    [Description("Checks if a file exists.")]
    public class IfFileExistsActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument,
        Category("Input"),
        Description("The full path of the file to check.")]
        public InArgument<string> FilePath { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var result = File.Exists(filePath);
            StatusMessage.Set(context, result ? "File exists." : "File does not exist.");
        }
    }
}