using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.CMDSessionActivities.Helpers;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Text;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CmdSessionActivities
{
    [DisplayName("Open CMD Session")]
    [Description("Opens a new CMD session with optional encoding settings.")]
    [ActivityMetaData(nodeImg: "/assets/CMDSession.svg")]
    public class OpenCmdSessionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Working Folder")]
        [Description("The directory where the CMD session should start.")]
        public InArgument<string> WorkingFolder { get; set; }

        [DisplayName("Change Code Page")]
        [Description("Specifies whether to change the code page in the CMD session.")]
        [DefaultValue(false)]
        public InArgument<bool> ChangeCodePage { get; set; }

        [DisplayName("Encoding")]
        [Description("The encoding to use if 'Change Code Page' is enabled.")]
        [DefaultValue(EncodingEnum.UTF8)]
        [RenderIfCondition(nameof(ChangeCodePage), true)]
        public InArgument<EncodingEnum> TextEncoding { get; set; }

        [DisplayName("CMD Session")]
        [Description("Holds the CMD process instance for reuse in subsequent activities.")]
        public OutArgument<Process> CmdSession { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var workingFolder = WorkingFolder.Get(context) ?? Environment.CurrentDirectory;
                if (!System.IO.Directory.Exists(workingFolder))
                    throw new ArgumentException($"Working folder does not exist: {workingFolder}");

                var changeCodePage = ChangeCodePage.Get(context);
                var encodingEnum = changeCodePage ? TextEncoding.Get(context) : EncodingEnum.UTF8;

                var startInfo = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    WorkingDirectory = workingFolder,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    StandardOutputEncoding = GetDotNetEncoding(encodingEnum),
                    StandardErrorEncoding = GetDotNetEncoding(encodingEnum)
                };

                var process = new Process { StartInfo = startInfo };
                CmdSessionStateHelper.AttachOutputCapture(process);
                process.Start();

                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                // Optionally change code page
                if (changeCodePage)
                {
                    string codePage = GetCodePageCommand(encodingEnum);
                    process.StandardInput.WriteLine($"chcp {codePage}");
                    process.StandardInput.Flush();
                }

                // Suppress command echoing for cleaner output
                process.StandardInput.WriteLine("@echo off");
                process.StandardInput.Flush();
                CmdSession.Set(context, process);            
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Background CMD session opened. PID: {process.Id}, Encoding: {encodingEnum}");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to open CMD session: {ex.Message}");
            }
        }

        // ----------------------
        // Helper Methods
        // ----------------------
        private static Encoding GetDotNetEncoding(EncodingEnum encoding)
        {
            switch (encoding)
            {
                case EncodingEnum.UTF8:
                    return Encoding.UTF8;
                case EncodingEnum.UTF7:
                    return Encoding.UTF7;
                case EncodingEnum.ASCII:
                    return Encoding.ASCII;
                case EncodingEnum.Windows1252:
                    return Encoding.GetEncoding(1252);
                case EncodingEnum.ISO8859_1:
                    return Encoding.GetEncoding(28591);
                case EncodingEnum.ISCIIAssamese:
                    return Encoding.GetEncoding(57009);
                case EncodingEnum.ISCIIOriya:
                    return Encoding.GetEncoding(57007);
                case EncodingEnum.ISCIIMalayalam:
                    return Encoding.GetEncoding(57006);
                case EncodingEnum.ISCIIKannada:
                    return Encoding.GetEncoding(57008);
                default:
                    return Encoding.UTF8;
            }
        }

        private static string GetCodePageCommand(EncodingEnum encoding)
        {
            switch (encoding)
            {
                case EncodingEnum.UTF8:
                    return "65001";
                case EncodingEnum.UTF7:
                    return "65000"; 
                case EncodingEnum.ASCII:
                    return "20127";
                case EncodingEnum.Windows1252:
                    return "1252"; 
                case EncodingEnum.ISO8859_1:
                    return "28591"; 
                case EncodingEnum.ISCIIAssamese:
                    return "57009"; 
                case EncodingEnum.ISCIIOriya:
                    return "57007";
                case EncodingEnum.ISCIIMalayalam:

                default:
                    throw new ArgumentOutOfRangeException(nameof(encoding), encoding, null);
            }
        }

        private static string GetEncodingDescription(EncodingEnum encoding)
        {
            switch (encoding)
            {
                case EncodingEnum.UTF8:
                    return "UTF-8 : Unicode (UTF-8)";
                case EncodingEnum.UTF7:
                    return "UTF-7 : Unicode (UTF-7)";
                case EncodingEnum.ASCII:
                    return "ASCII : US-ASCII";
                case EncodingEnum.Windows1252:
                    return "Windows-1252 : Western European (Windows)";
                case EncodingEnum.ISO8859_1:
                    return "ISO-8859-1 : Latin-1";
                case EncodingEnum.ISCIIAssamese:
                    return "x-iscii-as : ISCII Assamese";
                case EncodingEnum.ISCIIOriya:
                    return "x-iscii-or : ISCII Oriya";
                case EncodingEnum.ISCIIMalayalam:
                    return "x-iscii-ma : ISCII Malayalam";
                default:
                    throw new ArgumentOutOfRangeException(nameof(encoding), encoding, null);
            }
        }

        // Enums

        public enum EncodingEnum
        {
            [Display(Name = "UTF-8", Description = "UTF-8 : Unicode (UTF-8)")]
            UTF8,

            [Display(Name = "UTF-7", Description = "UTF-7 : Unicode (UTF-7)")]
            UTF7,

            [Display(Name = "ASCII", Description = "ASCII : US-ASCII")]
            ASCII,

            [Display(Name = "Windows-1252", Description = "Windows-1252 : Western European (Windows)")]
            Windows1252,

            [Display(Name = "ISO-8859-1", Description = "ISO-8859-1 : Latin-1")]
            ISO8859_1,

            [Display(Name = "x-iscii-as", Description = "x-iscii-as : ISCII Assamese")]
            ISCIIAssamese,

            [Display(Name = "x-iscii-or", Description = "x-iscii-or : ISCII Oriya")]
            ISCIIOriya,

            [Display(Name = "x-iscii-ma", Description = "x-iscii-ma : ISCII Malayalam")]
            ISCIIMalayalam,

            [Display(Name = "x-iscii-ka", Description = "x-iscii-ka : ISCII Kannada")]
            ISCIIKannada,
        }
    }
}