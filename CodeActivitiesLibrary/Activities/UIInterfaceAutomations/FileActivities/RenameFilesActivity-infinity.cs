using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Rename File(s)"), Description("Changes the names of one or more files.")]
    public class RenameFilesActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The source file paths to rename.")]
        public InArgument<IEnumerable<string>> SourceFilePaths { get; set; }

        [RequiredArgument, Category("Input"), Description("The new names for the files.")]
        public InArgument<IEnumerable<string>> NewNames { get; set; }

        [Category("Output"), Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var sourceFilePaths = SourceFilePaths.Get(context);
            var newNames = NewNames.Get(context);
            var status = "";

            try
            {
                var enumerator1 = sourceFilePaths.GetEnumerator();
                var enumerator2 = newNames.GetEnumerator();

                while (enumerator1.MoveNext() && enumerator2.MoveNext())
                {
                    var sourceFilePath = enumerator1.Current;
                    var newName = enumerator2.Current;

                    if (!File.Exists(sourceFilePath))
                        throw new ArgumentException($"Source file not found: {sourceFilePath}");

                    var directory = Path.GetDirectoryName(sourceFilePath);
                    var newFilePath = Path.Combine(directory, newName);

                    File.Move(sourceFilePath, newFilePath);
                }

                status = "Files renamed successfully.";
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error renaming files: {ex.Message}";
                StatusMessage.Set(context, status);
            }
        }
    }
}