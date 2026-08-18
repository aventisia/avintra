using NodeLibrary.SystemNodes.Enums;
using System.Diagnostics;
using System.Management;

namespace NodeLibrary.SystemNodes;

[DisplayName("If process"), Description("Marks the beginning of a conditional block of actions depending on whether a process is running or not.")]
[NodeMetadata(icon: "/assets/System.svg")]
public class IfProcessNode : BaseNode
{
    [DisplayName("If process"), Description("Specifies the condition to check (e.g., IsRunning, Isn't Running).")]
    public required InArgument<IfProcessConditionEnum> Condition { get; set; } = new InArgument<IfProcessConditionEnum>(IfProcessConditionEnum.IsRunning);

    [DisplayName("Process name"), Description("The name of the process to check.")]
    public required InArgument<ProcessNameEnum> ProcessName { get; set; } = new InArgument<ProcessNameEnum>(ProcessNameEnum.AggregatorHost);

    [DisplayName("From User"), Description("Indicates whether to check if the process is running under a specific user.")]
    public InArgument<bool> FromUser { get; set; } = new InArgument<bool>(false);

    [DisplayName("User name"), Description("The name of the user to check (only applicable if 'From User' is enabled).")]
    [RenderIfCondition(nameof(FromUser), true)]
    public InArgument<string> UserName { get; set; } = new InArgument<string>(string.Empty);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var condition = Condition.Get(context);
            var processName = ProcessName.Get(context).ToString();
            var fromUser = FromUser.Get(context);
            var userName = UserName.Get(context);

            if (string.IsNullOrWhiteSpace(processName))
                throw new ArgumentException("Process name cannot be empty.");

            var isRunning = false;

            if (fromUser)
            {
                var processes = Process.GetProcessesByName(processName);
                isRunning = processes.Any(p =>
                {
                    try
                    {
                        var processOwner = GetProcessOwner(p.Id);
                        return processOwner?.Equals(userName, StringComparison.OrdinalIgnoreCase) == true;
                    }
                    catch
                    {
                        return false;
                    }
                });
            }
            else
            {
                isRunning = Process.GetProcessesByName(processName).Length > 0;
            }

            var result = condition switch
            {
                IfProcessConditionEnum.IsRunning => isRunning,
                IfProcessConditionEnum.IsntRunning => !isRunning,
                _ => throw new NotSupportedException($"Unsupported condition: {condition}")
            };

            status = $"Process '{processName}' {(result ? "matches" : "does not match")} the condition.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error checking process status: {ex.Message}");
        }
    }

    private static string? GetProcessOwner(int processId)
    {
        try
        {
            using var process = Process.GetProcessById(processId);
            if (process.MainModule?.FileName is not { Length: > 0 } processPath)
                return null;

            var query = $@"SELECT * FROM Win32_Process WHERE ProcessId={processId}";
            using var searcher = new ManagementObjectSearcher(query);
            foreach (ManagementObject obj in searcher.Get())
            {
                if (obj["Caption"] != null && obj["ExecutablePath"]?.ToString() == processPath)
                    return obj["Handle"]?.ToString();
            }
        }
        catch
        {
            return null;
        }

        return null;
    }
}

public enum IfProcessConditionEnum
{
    [Display(Name = "Is Running", Description = "Checks if the process is currently running.")]
    IsRunning,

    [Display(Name = "Is Not Running", Description = "Checks if the process is not currently running.")]
    IsntRunning
}
