using System.Diagnostics;
using System.Management;

namespace NodeLibrary.SystemNodes;

[DisplayName("Terminate process"), Description("Immediately stops a running process.")]
[NodeMetadata(icon: "/assets/System.svg")]
public class TerminateProcessNode : BaseNode
{
    [DisplayName("Specify process by"), Description("Specifies whether to terminate the process by name or ID.")]
    public required InArgument<SpecifyProcessByEnum> SpecifyProcessBy { get; set; } = new InArgument<SpecifyProcessByEnum>(SpecifyProcessByEnum.ProcessName);

    [DisplayName("Process name"), Description("The name of the process to terminate (only applicable if 'Specify process by' is set to 'Process name').")]
    [RenderIfCondition(nameof(SpecifyProcessBy), SpecifyProcessByEnum.ProcessName)]
    public InArgument<string> ProcessName { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Process ID"), Description("The ID of the process to terminate (only applicable if 'Specify process by' is set to 'Process ID').")]
    [RenderIfCondition(nameof(SpecifyProcessBy), SpecifyProcessByEnum.ProcessId)]
    public InArgument<int> ProcessId { get; set; } = new InArgument<int>(0);

    [DisplayName("From User"), Description("Indicates whether to check if the process is running under a specific user.")]
    public InArgument<bool> FromUser { get; set; } = new InArgument<bool>(false);

    [DisplayName("User name"), Description("The name of the user to check (only applicable if 'From User' is enabled).")]
    [RenderIfCondition(nameof(FromUser), true)]
    public InArgument<string> UserName { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Status Message"), Description("Provides status information about the operation.")]
    public OutArgument<string> StatusMessages { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var specifyProcessBy = SpecifyProcessBy.Get(context);
            var processName = ProcessName.Get(context);
            var processId = ProcessId.Get(context);
            var fromUser = FromUser.Get(context);
            var userName = UserName.Get(context);

            if ((specifyProcessBy == SpecifyProcessByEnum.ProcessName && string.IsNullOrWhiteSpace(processName)) ||
                (specifyProcessBy == SpecifyProcessByEnum.ProcessId && processId <= 0))
            {
                throw new ArgumentException("Invalid process specification.");
            }

            IEnumerable<Process> processes = specifyProcessBy switch
            {
                SpecifyProcessByEnum.ProcessName => GetProcessesByName(processName, fromUser, userName),
                SpecifyProcessByEnum.ProcessId => GetProcessesById(processId, fromUser, userName),
                _ => throw new NotSupportedException($"Unsupported specify process by option: {specifyProcessBy}")
            };

            var terminatedCount = 0;
            var errors = new List<string>();

            foreach (var process in processes ?? [])
            {
                try
                {
                    if (!process.HasExited)
                    {
                        process.Kill();
                        terminatedCount++;
                    }
                }
                catch (Exception ex)
                {
                    errors.Add(ex.Message);
                }
            }

            if (errors.Count > 0)
                throw new InvalidOperationException($"Error terminating one or more processes: {string.Join(" | ", errors)}");

            status = $"Terminated {terminatedCount} process(es).";
            StatusMessages.Set(context, status);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            var error = $"Error terminating process: {ex.Message}";
            StatusMessages.Set(context, error);
            StatusMessage.Set(context, error);
        }
    }

    private static IEnumerable<Process> GetProcessesByName(string processName, bool fromUser, string userName)
    {
        var processes = Process.GetProcessesByName(processName);

        if (!fromUser || string.IsNullOrWhiteSpace(userName))
            return processes;

        return processes.Where(p =>
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
        });
    }

    private static IEnumerable<Process> GetProcessesById(int processId, bool fromUser, string userName)
    {
        try
        {
            var process = Process.GetProcessById(processId);
            if (!fromUser || string.IsNullOrWhiteSpace(userName))
                return [process];

            var owner = GetProcessOwner(processId);
            return owner?.Equals(userName, StringComparison.OrdinalIgnoreCase) == true ? [process] : [];
        }
        catch
        {
            return [];
        }
    }

    private static string? GetProcessOwner(int processId)
    {
        try
        {
            var query = $@"SELECT * FROM Win32_Process WHERE ProcessId={processId}";
            using var searcher = new ManagementObjectSearcher(query);
            foreach (ManagementObject obj in searcher.Get())
            {
                var args = new object[] { null };
                if ((uint)obj.InvokeMethod("GetOwner", args) == 0)
                    return args[0] as string;
            }
        }
        catch
        {
            return null;
        }

        return null;
    }
}

public enum SpecifyProcessByEnum
{
    [Display(Name = "Process Name", Description = "Identifies the process by its name (e.g., notepad).")]
    ProcessName,

    [Display(Name = "Process ID", Description = "Identifies the process by its unique numeric ID.")]
    ProcessId
}
