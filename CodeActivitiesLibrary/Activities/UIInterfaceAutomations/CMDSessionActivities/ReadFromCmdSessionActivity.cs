using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CMDSessionActivities
{
    [DisplayName("Read from CMD Session")]
    [Description("Reads the output of a CMD session.")]
    public class ReadFromCmdSessionActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("CMD Session")]
        [Description("The process representing the CMD session.")]
        public InArgument<Process> CmdSession { get; set; }


        [DisplayName("Separate Output from Error")]
        [Description("Specifies whether to separate standard output from standard error.")]
        public InArgument<bool> SeparateOutputFromError { get; set; } = new InArgument<bool>(true);

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("CmdOutput")]
        [Description("The CMD session's standard output.")]
        public OutArgument<string> CmdOutput { get; set; }


        [DisplayName("CmdError")]
        [Description("The CMD session's standard error (if separated).")]
        public OutArgument<string> CmdError { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var cmdSession = CmdSession.Get(context);
                var separateOutputFromError = SeparateOutputFromError.Get(context);

                if (cmdSession == null)
                    throw new ArgumentException("CMD session cannot be null.");

                // Ensure the process has started
                if (!cmdSession.HasExited)
                {
                    // Wait for the process to exit
                    cmdSession.WaitForExit();
                }

                // Read standard output and standard error
                string stdout = cmdSession.StandardOutput.ReadToEnd();
                string stderr = cmdSession.StandardError.ReadToEnd();

                // Set outputs
                CmdOutput.Set(context, stdout);

                if (separateOutputFromError)
                {
                    CmdError.Set(context, stderr);
                }
                else
                {
                    // Combine stdout and stderr into a single output
                    CmdOutput.Set(context, $"{stdout}{stderr}");
                }

                status += $" Successfully read output from CMD session.";
            }
            catch (Exception ex)
            {
                status = $"Error reading CMD session: {ex.Message}";
            }

            Console.WriteLine(status);
        }
    }

}