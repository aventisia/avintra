using NodeLibrary.SystemNodes.Enums;
using System.Diagnostics;
using System.Management;

namespace NodeLibrary.SystemNodes;

[DisplayName("Wait For Process"), Description("Waits for a specific process to start or stop.")]
[NodeMetadata(icon: "/assets/System.svg")]
public class WaitForProcessNode : BaseNode
{
    [DisplayName("Process Name"), Description("The name of the process to monitor.")]
    public required InArgument<ProcessNameEnum> ProcessName { get; set; }

    [DisplayName("From User"), Description("Indicates whether the process should be triggered by a specific user.")]
    public InArgument<bool> FromUser { get; set; } = new InArgument<bool>(false);

    [DisplayName("User Name"), Description("The name of the user associated with the process.")]
    [RenderIfCondition(nameof(FromUser), true)]
    public InArgument<string> UserName { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Wait For Process To"), Description("Specifies whether to wait for the process to start or stop.")]
    public InArgument<WaitForProcessEnum> WaitForProcessTo { get; set; } = new InArgument<WaitForProcessEnum>(WaitForProcessEnum.Start);

    [DisplayName("Fail With Timeout Error"), Description("Indicates whether the activity should fail if the timeout is reached.")]
    public InArgument<bool> FailWithTimeoutError { get; set; } = new InArgument<bool>(false);

    [DisplayName("Duration (Seconds)"), Description("The maximum time in seconds to wait for the process condition.")]
    [RenderIfCondition(nameof(FailWithTimeoutError), true)]
    public InArgument<int> Duration { get; set; } = new InArgument<int>(60);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var processName = ProcessName.Get(context).ToString();
            var fromUser = FromUser.Get(context);
            var userName = fromUser ? UserName.Get(context) : null;
            var waitForProcessTo = WaitForProcessTo.Get(context);
            var failWithTimeout = FailWithTimeoutError.Get(context);
            var duration = failWithTimeout ? Duration.Get(context) : 60;

            var timeoutTimer = TimeSpan.FromSeconds(duration);
            var stopwatch = Stopwatch.StartNew();

            var conditionMet = false;
            while (stopwatch.Elapsed < timeoutTimer)
            {
                var processes = Process.GetProcessesByName(processName);

                if (fromUser && !string.IsNullOrEmpty(userName))
                {
                    processes =
                    [
                        .. processes.Where(p =>
                        {
                            try
                            {
                                var owner = GetProcessOwner(p.Id);
                                return owner?.Equals(userName, StringComparison.OrdinalIgnoreCase) == true;
                            }
                            catch
                            {
                                return false;
                            }
                        })
                    ];
                }

                var exists = processes.Length > 0;
                if ((waitForProcessTo == WaitForProcessEnum.Start && exists) ||
                    (waitForProcessTo == WaitForProcessEnum.Stop && !exists))
                {
                    conditionMet = true;
                    break;
                }

                Thread.Sleep(500);
            }

            stopwatch.Stop();

            if (conditionMet)
            {
                status =
                    $"Process '{processName}' {(waitForProcessTo == WaitForProcessEnum.Start ? "started" : "stopped")} successfully after {stopwatch.Elapsed.TotalSeconds:F1} seconds.";
            }
            else
            {
                var message =
                    $"Timed out waiting for process '{processName}' to {(waitForProcessTo == WaitForProcessEnum.Start ? "start" : "stop")}.";

                if (failWithTimeout)
                    throw new TimeoutException(message);

                status = message + " Proceeding without error.";
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error waiting for process: {ex.Message}");
        }
    }

    private static string? GetProcessOwner(int processId)
    {
        try
        {
            using var searcher = new ManagementObjectSearcher($"SELECT * FROM Win32_Process WHERE ProcessId = {processId}");
            foreach (ManagementObject obj in searcher.Get())
            {
                var ownerInfo = new string[2];
                var returnVal = Convert.ToInt32(obj.InvokeMethod("GetOwner", ownerInfo));

                if (returnVal == 0)
                {
                    var user = ownerInfo[0];
                    var domain = ownerInfo[1];
                    return string.IsNullOrEmpty(domain) ? user : $"{domain}\\{user}";
                }
            }
        }
        catch
        {
            return null;
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
