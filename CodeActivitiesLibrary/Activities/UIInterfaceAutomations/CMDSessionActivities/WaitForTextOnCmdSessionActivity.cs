using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CMDSessionActivities
{
    [DisplayName("Wait for Text on CMD Session"), Description("Waits for a specific text on an open CMD session.")]
    public class WaitForTextOnCmdSessionActivity : CodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The process ID of the open CMD session.")]
        public InArgument<int> ProcessId { get; set; }

        [RequiredArgument, Category("Input"), Description("The text to wait for in the CMD session output.")]
        public InArgument<string> ExpectedText { get; set; }

        [Category("Output"), Description("Returns true if the expected text was found, otherwise false.")]
        public OutArgument<bool> TextFound { get; set; }

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var processId = ProcessId.Get(context);
            var expectedText = ExpectedText.Get(context);
            var textFound = false;
            var status = "";

            try
            {
                // Get the CMD process using the provided process ID
                var cmdProcess = Process.GetProcessById(processId);

                // Wait for the expected text in the CMD session output
                if (cmdProcess != null && !cmdProcess.HasExited)
                {
                    using (var reader = cmdProcess.StandardOutput)
                    {
                        string line;
                        while ((line = reader.ReadLine()) != null)
                        {
                            if (line.Contains(expectedText))
                            {
                                textFound = true;
                                break;
                            }
                        }
                    }

                    status = textFound ? $"Expected text '{expectedText}' found in CMD session." : $"Expected text '{expectedText}' not found in CMD session.";
                }
                else
                {
                    textFound = false;
                    status = "Failed to wait for text on CMD session: Invalid process ID or session closed.";
                }
            }
            catch (Exception ex)
            {
                textFound = false;
                status = $"Error waiting for text on CMD session: {ex.Message}";
            }

            TextFound.Set(context, textFound);
            StatusMessage.Set(context, status);
        }
    }
}