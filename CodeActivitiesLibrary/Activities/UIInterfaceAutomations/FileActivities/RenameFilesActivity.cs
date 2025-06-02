using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities.Enums;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    [DisplayName("Rename File(s)")]
    [Description("Renames one or more files.")]
    public class RenameFileActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("File(s) to rename")]
        [Description("The path(s) of the file(s) to rename. Supports wildcards like *.txt.")]
        public InArgument<string> FilesToRename { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Rename scheme")]
        [Description("Specifies the rename scheme to apply.")]
        [DefaultValue(RenameSchemeEnum.SetNewName)]
        public InArgument<RenameSchemeEnum> RenameScheme { get; set; }

        [Category("Input")]
        [DisplayName("New file name")]
        [Description("The new name for the file(s). Required for some rename schemes.")]
        public InArgument<string> NewFileName { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Keep extension")]
        [Description("Indicates whether to keep the original file extension.")]
        public InArgument<bool> KeepExtension { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("If file exists")]
        [Description("Specifies the behavior when a file already exists in the destination folder.")]
        [DefaultValue(IfExistsActionEnum.DoNothing)]
        public InArgument<IfExistsActionEnum> IfExistsAction { get; set; }

        [Category("Output")]
        [DisplayName("Renamed Files")]
        [Description("Returns the list of successfully renamed files.")]
        public OutArgument<List<string>> RenamedFiles { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            // Get input arguments
            var filesToRename = FilesToRename.Get(context);
            var renameScheme = RenameScheme.Get(context);
            var newFileName = NewFileName.Get(context);
            var ifExistsAction = IfExistsAction.Get(context);
            var keepExtension = KeepExtension.Get(context); // Retrieve the value of KeepExtension

            // Validate inputs
            if (string.IsNullOrWhiteSpace(filesToRename))
            {
                throw new ArgumentException("Files to rename cannot be empty.");
            }

            try
            {
                // Split source files by semicolon (supports multiple files)
                var filePatterns = filesToRename.Split(new[] { ';' }, StringSplitOptions.RemoveEmptyEntries);

                // List to store successfully renamed files
                var renamedFiles = new List<string>();

                foreach (var pattern in filePatterns)
                {
                    // Expand wildcards if present
                    var expandedPaths = GetExpandedPaths(pattern);

                    foreach (var filePath in expandedPaths)
                    {
                        if (!File.Exists(filePath))
                        {
                            continue; // Skip non-existent files
                        }

                        var newFilePath = ApplyRenameScheme(filePath, renameScheme, newFileName, keepExtension);

                        // Handle existing file scenario
                        if (File.Exists(newFilePath))
                        {
                            switch (ifExistsAction)
                            {
                                case IfExistsActionEnum.DoNothing:
                                    continue; // Skip existing file
                                case IfExistsActionEnum.Overwrite:
                                    File.Delete(newFilePath); // Delete existing file
                                    break;
                                default:
                                    throw new ArgumentException("Invalid 'If file exists' action specified.");
                            }
                        }

                        // Rename the file
                        File.Move(filePath, newFilePath);
                        renamedFiles.Add(newFilePath);
                    }
                }

                // Set the output argument
                RenamedFiles.Set(context, renamedFiles);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error renaming files: {ex.Message}");
            }
        }

        private string ApplyRenameScheme(string filePath, RenameSchemeEnum renameScheme, string newFileName,
            bool keepExtension)
        {
            var fileName = Path.GetFileNameWithoutExtension(filePath);
            var extension = Path.GetExtension(filePath);

            switch (renameScheme)
            {
                case RenameSchemeEnum.SetNewName:
                    return Path.Combine(Path.GetDirectoryName(filePath),
                        $"{newFileName}{(keepExtension ? extension : "")}");

                case RenameSchemeEnum.AddText:
                    return Path.Combine(Path.GetDirectoryName(filePath),
                        $"{fileName}_{newFileName}{(keepExtension ? extension : "")}");

                case RenameSchemeEnum.RemoveText:
                    return Path.Combine(Path.GetDirectoryName(filePath),
                        $"{fileName.Replace(newFileName, "")}{(keepExtension ? extension : "")}");

                case RenameSchemeEnum.ReplaceText:
                    return Path.Combine(Path.GetDirectoryName(filePath),
                        $"{fileName.Replace(newFileName, "")}{(keepExtension ? extension : "")}");

                case RenameSchemeEnum.ChangeExtension:
                    return Path.Combine(Path.GetDirectoryName(filePath), $"{fileName}{newFileName}");

                case RenameSchemeEnum.AddDateTime:
                    return Path.Combine(Path.GetDirectoryName(filePath),
                        $"{fileName}_{DateTime.Now.ToString("yyyyMMddHHmmss")}{(keepExtension ? extension : "")}");

                case RenameSchemeEnum.MakeSequential:
                    var counter = 1;
                    var baseName = Path.GetFileNameWithoutExtension(filePath);
                    var newName = $"{baseName}_{counter}";
                    while (File.Exists(Path.Combine(Path.GetDirectoryName(filePath),
                               $"{newName}{(keepExtension ? extension : "")}")))
                    {
                        counter++;
                        newName = $"{baseName}_{counter}";
                    }

                    return Path.Combine(Path.GetDirectoryName(filePath),
                        $"{newName}{(keepExtension ? extension : "")}");

                default:
                    throw new ArgumentException("Invalid rename scheme specified.");
            }
        }

        private IEnumerable<string> GetExpandedPaths(string pattern)
        {
            // Expand wildcards using Directory.GetFiles
            return Directory.GetFiles(Path.GetDirectoryName(pattern), Path.GetFileName(pattern));
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
}