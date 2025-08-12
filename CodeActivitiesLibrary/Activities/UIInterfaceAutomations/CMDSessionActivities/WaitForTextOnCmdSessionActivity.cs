using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CmdSessionActivities
{
    [DisplayName("Wait for Text on CMD Session")]
    [Description("Waits for a specific text on a previously opened CMD session.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/CMDSession.svg")]
    public class WaitForTextOnCmdSessionActivity : BaseCodeActivity
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

                // Gracefully wait for process start
                if (!cmdSession.HasExited && !cmdSession.Responding)
                    Thread.Sleep(500);

                RegexOptions regexOptions = ignoreCase ? RegexOptions.IgnoreCase : RegexOptions.None;
                string output = string.Empty;
                bool textFound = false;
                DateTime startTime = DateTime.Now;
                using (var reader = cmdSession.StandardOutput)
                {
                    while (!textFound && !cmdSession.HasExited &&
                           (timeoutSeconds == 0 || output.Length < 1024 * 1024)) // limit buffer size
                    {
                        string line = reader.ReadLine();
                        if (line != null)
                        {
                            output += line + Environment.NewLine;

                            if (isRegularExpression)
                                textFound = Regex.IsMatch(output, textToWaitFor, regexOptions);
                            else
                                textFound = output.Contains(textToWaitFor);

                            if (textFound) break;
                        }

                        if (timeoutSeconds > 0 && timeoutSeconds <= (DateTime.Now - startTime).TotalSeconds)
                            break;

                        Thread.Sleep(100); // Avoid CPU overuse
                    }
                }

                if (textFound)
                {
                    status += $" Successfully found text: '{textToWaitFor}'";
                    IsSuccess.Set(context, true);
                }
                else
                {
                    status = $"Text not found: '{textToWaitFor}'";
                    IsSuccess.Set(context, false);
                }

                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error waiting for text: {ex.Message}");
            }
        }
    }
}