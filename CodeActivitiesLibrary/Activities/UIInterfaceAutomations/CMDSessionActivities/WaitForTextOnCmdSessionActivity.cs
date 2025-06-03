using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Threading;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.CMDSessionActivities
{
    [DisplayName("Wait for Text on CMD Session")]
    [Description("Waits for a specific text on a previously opened CMD session.")]
    public class WaitForTextOnCmdSessionActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("CMD Session")]
        [Description("The process representing the open CMD session.")]
        public InArgument<Process> CmdSession { get; set; }

        [RequiredArgument]

        [DisplayName("Text to Wait For")]
        [Description("The text or regular expression to wait for in the CMD session output.")]
        public InArgument<string> TextToWaitFor { get; set; }


        [DisplayName("Is Regular Expression")]
        [Description("Specifies whether the 'Text to Wait For' is a regular expression.")]
        public InArgument<bool> IsRegularExpression { get; set; } = new InArgument<bool>(false);


        [DisplayName("Ignore Case")]
        [Description("Specifies whether to ignore case when matching the text.")]
        public InArgument<bool> IgnoreCase { get; set; } = new InArgument<bool>(true);


        [DisplayName("Timeout")]
        [Description("The maximum time (in seconds) to wait before timing out. Use 0 for no timeout.")]
        public InArgument<int> Timeout { get; set; } = new InArgument<int>(10); // Default timeout

        // ----------------------
        // Output Arguments
        // ----------------------

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var cmdSession = CmdSession.Get(context);
                var textToWaitFor = TextToWaitFor.Get(context);
                var isRegularExpression = IsRegularExpression.Get(context);
                var ignoreCase = IgnoreCase.Get(context);
                var timeoutSeconds = Timeout.Get(context);

                if (cmdSession == null)
                    throw new ArgumentException("CMD session cannot be null.");

                if (string.IsNullOrWhiteSpace(textToWaitFor))
                    throw new ArgumentException("Text to wait for cannot be empty.");

                // Give the process a small grace period before checking if it's still alive
                if (cmdSession.HasExited)
                {
                    // Try to wait a bit more just in case
                    if (!cmdSession.WaitForExit(1000)) // Wait up to 1 second
                    {
                        throw new InvalidOperationException("CMD session has already exited.");
                    }
                }

                // Configure regex options based on input arguments
                RegexOptions regexOptions = ignoreCase ? RegexOptions.IgnoreCase : RegexOptions.None;

                // Initialize output and flag
                string output = string.Empty;
                bool textFound = false;

                // Lock object for thread-safe access
                object lockObj = new object();

                // Start reading output asynchronously
                using (var reader = cmdSession.StandardOutput)
                {
                    Thread readThread = new Thread(() =>
                    {
                        while (!textFound && !cmdSession.HasExited)
                        {
                            string line = reader.ReadLine();
                            if (line != null)
                            {
                                lock (lockObj)
                                {
                                    output += line + Environment.NewLine;

                                    if (isRegularExpression)
                                    {
                                        textFound = Regex.IsMatch(output, textToWaitFor, regexOptions);
                                    }
                                    else
                                    {
                                        textFound = output.Contains(textToWaitFor);
                                        textFound = true;
                                    }
                                }
                            }
                        }
                    });

                    readThread.Start();

                    // Wait for match or timeout
                    if (timeoutSeconds > 0)
                    {
                        if (!readThread.Join(TimeSpan.FromSeconds(timeoutSeconds)))
                        {
                            status = $"Timeout occurred after {timeoutSeconds} seconds.";
                        }
                    }
                    else
                    {
                        readThread.Join(); // No timeout
                    }

                    // Final check
                    lock (lockObj)
                    {
                        if (textFound)
                        {
                            status += $" Successfully found text: '{textToWaitFor}'";
                        }
                        else
                        {
                            status = $"Text not found: '{textToWaitFor}'";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"Error waiting for text: {ex.Message}";
            }

            // Set the output argument
            StatusMessage.Set(context, status);

            Console.WriteLine(status);
        }
    }
}