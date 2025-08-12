using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.SystemActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Management;


namespace CodeActivitiesLibrary.UiInterfaceAutomations.SystemActivities
{
    [DisplayName("Wait For Process")]
    [Description("Waits for a specific process to start or stop.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/System.svg")]
    public class WaitForProcessActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Process Name")]
        [Description("The name of the process to monitor.")]
        public InArgument<ProcessNameEnum> ProcessName { get; set; }

        [DisplayName("From User")]
        [Description("Indicates whether the process should be triggered by a specific user.")]
        public InArgument<bool> FromUser { get; set; }

        [DisplayName("User Name")]
        [Description("The name of the user associated with the process.")]
        [RenderIfCondition(nameof(FromUser), true)]
        public InArgument<string> UserName { get; set; }

        [DisplayName("Wait For Process To")]
        [Description("Specifies whether to wait for the process to start or stop.")]
        public InArgument<WaitForProcessEnum> WaitForProcessTo { get; set; }

        [DisplayName("Fail With Timeout Error")]
        [Description("Indicates whether the activity should fail if the timeout is reached.")]
        public InArgument<bool> FailWithTimeoutError { get; set; }

        [DisplayName("Duration (Seconds)")]
        [Description("The maximum time in seconds to wait for the process condition.")]
        [RenderIfCondition(nameof(FailWithTimeoutError), true)]
        public InArgument<int> Duration { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
                try
                {
                    var processName = ProcessName.Get(context).ToString();
                    var fromUser = FromUser.Get(context);
                    var userName = fromUser ? UserName.Get(context) : null;
                    var waitForProcessTo = WaitForProcessTo.Get(context);
                    var failWithTimeout = FailWithTimeoutError.Get(context);
                    var duration = failWithTimeout ? Duration.Get(context) : 60; // Default timeout if not set

                    bool conditionMet = false;
                    var timeoutTimer = new TimeSpan(0, 0, duration);
                    var stopwatch = System.Diagnostics.Stopwatch.StartNew();

                    while (stopwatch.Elapsed < timeoutTimer)
                    {
                        var processes = Process.GetProcessesByName(processName);

                        if (fromUser && !string.IsNullOrEmpty(userName))
                        {
                            processes = processes.Where(p =>
                            {
                                try
                                {
                                    string owner = GetProcessOwner(p.Id);
                                    return owner?.Equals(userName, StringComparison.OrdinalIgnoreCase) == true;
                                }
                                catch
                                {
                                    return false;
                                }
                            }).ToArray();
                        }

                        bool exists = processes.Length > 0;

                        if ((waitForProcessTo == WaitForProcessEnum.Start && exists) ||
                            (waitForProcessTo == WaitForProcessEnum.Stop && !exists))
                        {
                            conditionMet = true;
                            break;
                        }

                        System.Threading.Thread.Sleep(500); // Poll every 0.5 seconds
                    }

                    stopwatch.Stop();

                    if (conditionMet)
                    {
                        StatusMessage.Set(context, $"Process '{processName}' {(waitForProcessTo == WaitForProcessEnum.Start ? "started" : "stopped")} successfully after {stopwatch.Elapsed.TotalSeconds:F1} seconds.");
                        IsSuccess.Set(context, true);
                    }
                    else
                    {
                        string message = $"Timed out waiting for process '{processName}' to {(waitForProcessTo == WaitForProcessEnum.Start ? "start" : "stop")}.";

                        if (failWithTimeout)
                        {
                            StatusMessage.Set(context, message);
                            IsSuccess.Set(context, false);
                        }
                        else
                        {
                            StatusMessage.Set(context, message + " Proceeding without error.");
                            IsSuccess.Set(context, true);
                        }
                    }
                }
                catch (Exception ex)
                {
                    StatusMessage.Set(context, $"Error waiting for process: {ex.Message}");
                    IsSuccess.Set(context, false);
                }
        }

        private static string GetProcessOwner(int processId)
        {
            try
            {
                using (var searcher = new ManagementObjectSearcher(
                    $"SELECT * FROM Win32_Process WHERE ProcessId = {processId}"))
                {
                    foreach (ManagementObject obj in searcher.Get())
                    {
                        string[] ownerInfo = new string[2];
                        // ownerInfo[0] = User, ownerInfo[1] = Domain
                        int returnVal = Convert.ToInt32(obj.InvokeMethod("GetOwner", ownerInfo));

                        if (returnVal == 0)
                        {
                            // success
                            string user = ownerInfo[0];
                            string domain = ownerInfo[1];
                            return string.IsNullOrEmpty(domain) ? user : $"{domain}\\{user}";
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // usually "Access Denied" or "Insufficient Privilege"
                Console.WriteLine($"Error getting process owner for PID {processId}: {ex.Message}");
            }
            return null;
        }
    }

    public enum WaitForProcessEnum
    {
        [Display(Name = "Start", Description = "Waits for the process to start.")]
        Start,

        [Display(Name = "Stop", Description = "Waits for the process to stop.")]
        Stop
    }
}