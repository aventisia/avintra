using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Diagnostics;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CmdSessionActivities
{
    [DisplayName("Close CMD Session")]
    [Description("Closes a previously opened CMD session.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/CMDSession.svg")]
    public class CloseCmdSessionActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("CMD Session")]
        [Description("The process representing the open CMD session.")]
        public InArgument<Process> CmdSession { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var cmdSession = CmdSession.Get(context);

                if (cmdSession == null)
                    throw new ArgumentException("CMD session cannot be null.");

                if (!cmdSession.HasExited)
                {
                    try
                    {
                        cmdSession.StandardInput.WriteLine("exit");
                        cmdSession.StandardInput.Flush();
                        if (!cmdSession.WaitForExit(2000)) // Wait up to 2 seconds
                        {
                            cmdSession.Kill(); // Force close if not responding
                        }

                        status += ": CMD session closed gracefully.";
                    }
                    catch
                    {
                        cmdSession.Kill();
                        status += ": CMD session forcibly killed.";
                    }
                }
                else
                {
                    status += ": CMD session already exited.";
                }

                status += $" Successfully closed CMD session.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error closing CMD session: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
    
}