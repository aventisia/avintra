using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CMDSessionActivities
{
    [DisplayName("Open CMD Session")]
    [Description("Opens a new CMD session with optional encoding settings.")]
    public class OpenCmdSessionActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Working Folder")]
        [Description("The directory where the CMD session should start.")]
        public InArgument<string> WorkingFolder { get; set; }


        [DisplayName("Change Code Page")]
        [Description("Specifies whether to change the code page in the CMD session.")]
        public InArgument<bool> ChangeCodePage { get; set; } = new InArgument<bool>(false);


        [DisplayName("Encoding")]
        [Description("The encoding to use if 'Change Code Page' is enabled.")]
        [DefaultValue(EncodingEnum.UTF8)]
        [RenderIfCondition(nameof(ChangeCodePage), true)]
        public InArgument<EncodingEnum> Encoding { get; set; } =
            new InArgument<EncodingEnum>(EncodingEnum.UTF8);

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("CMD Session")]
        [Description("Details of the opened CMD session.")]
        public OutArgument<string> CmdSession { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var workingFolder = WorkingFolder.Get(context);
                var changeCodePage = ChangeCodePage.Get(context);
                var encoding = Encoding.Get(context);

                if (string.IsNullOrWhiteSpace(workingFolder))
                    throw new ArgumentException("Working folder cannot be empty.");

                // Start CMD process
                using (var process = new Process())
                {
                    process.StartInfo.FileName = "cmd.exe";
                    process.StartInfo.WorkingDirectory = workingFolder;

                    // Set encoding if required
                    if (changeCodePage)
                    {
                        string codePageCommand = GetCodePageCommand(encoding);
                        process.StartInfo.Arguments = $"/K chcp {codePageCommand}";
                    }

                    process.Start();
                    process.WaitForExit();

                    // Store the CMD session details (e.g., PID or command used)
                    string cmdSessionDetails = $"CMD Session started in {workingFolder}";
                    if (changeCodePage)
                    {
                        cmdSessionDetails += $" with encoding: {GetEncodingDescription(encoding)}";
                    }

                    CmdSession.Set(context, cmdSessionDetails);
                    status += $" Successfully opened CMD session in '{workingFolder}'.";
                }
            }
            catch (Exception ex)
            {
                status = $"Error opening CMD session: {ex.Message}";
            }

            // Optionally, you can log or display the status message
            Console.WriteLine(status);
        }

        // ----------------------
        // Helper Methods
        // ----------------------

        private static string GetCodePageCommand(EncodingEnum encoding)
        {
            switch (encoding)
            {
                case EncodingEnum.UTF8:
                    return "65001"; // UTF-8
                case EncodingEnum.UTF7:
                    return "65000"; // UTF-7
                case EncodingEnum.ASCII:
                    return "20127"; // ASCII
                case EncodingEnum.Windows1252:
                    return "1252"; // Windows-1252
                case EncodingEnum.ISO8859_1:
                    return "28591"; // ISO-8859-1
                case EncodingEnum.ISCIIAssamese:
                    return "57009"; // ISCII Assamese
                case EncodingEnum.ISCIIOriya:
                    return "57007"; // ISCII Oriya
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

        // ----------------------
        // Enums
        // ----------------------

        public enum EncodingEnum
        {
            [Description("UTF-8 : Unicode (UTF-8)")]
            UTF8,
            [Description("UTF-7 : Unicode (UTF-7)")]
            UTF7,
            [Description("ASCII : US-ASCII")]
            ASCII,
            [Description("Windows-1252 : Western European (Windows)")]
            Windows1252,
            [Description("ISO-8859-1 : Latin-1")]
            ISO8859_1,
            [Description("x-iscii-as : ISCII Assamese")]
            ISCIIAssamese,
            [Description("x-iscii-or : ISCII Oriya")]
            ISCIIOriya,
            [Description("x-iscii-ma : ISCII Malayalam")]
            ISCIIMalayalam,
            [Description("x-iscii-ka : ISCII Kannada")]
            ISCIIKannada,

        }
    }
}