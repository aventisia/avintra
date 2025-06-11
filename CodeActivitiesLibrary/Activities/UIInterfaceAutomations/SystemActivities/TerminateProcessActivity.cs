using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Management;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.SystemActivities
{
    [DisplayName("Terminate process")]
    [Description("Immediately stops a running process.")]
    public class TerminateProcessActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Specify process by")]
        [Description("Specifies whether to terminate the process by name or ID.")]
        public InArgument<SpecifyProcessByEnum> SpecifyProcessBy { get; set; }


        [DisplayName("Process name")]
        [Description(
            "The name of the process to terminate (only applicable if 'Specify process by' is set to 'Process name').")]
        [RenderIfCondition(nameof(SpecifyProcessBy), SpecifyProcessByEnum.ProcessName)]
        public InArgument<string> ProcessName { get; set; }


        [DisplayName("Process ID")]
        [Description(
            "The ID of the process to terminate (only applicable if 'Specify process by' is set to 'Process ID').")]
        [RenderIfCondition(nameof(SpecifyProcessBy), SpecifyProcessByEnum.ProcessId)]
        public InArgument<int> ProcessId { get; set; }


        [DisplayName("From User")]
        [Description("Indicates whether to check if the process is running under a specific user.")]
        public InArgument<bool> FromUser { get; set; }


        [DisplayName("User name")]
        [Description("The name of the user to check (only applicable if 'From User' is enabled).")]
        [RenderIfCondition(nameof(FromUser), true)]
        public InArgument<string> UserName { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Status Message")]
        [Description("Provides status information about the operation.")]
        public OutArgument<string> StatusMessages { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";
            try
            {
                var specifyProcessBy = SpecifyProcessBy.Get(context);
                var processName = ProcessName.Get(context);
                var processId = ProcessId.Get(context);
                var fromUser = FromUser.Get(context);
                var userName = UserName.Get(context);

                if ((specifyProcessBy == SpecifyProcessByEnum.ProcessName && string.IsNullOrWhiteSpace(processName)) ||
                    (specifyProcessBy == SpecifyProcessByEnum.ProcessId && processId <= 0))
                    throw new ArgumentException("Invalid process specification.");

                IEnumerable<Process> processes = null;

                switch (specifyProcessBy)
                {
                    case SpecifyProcessByEnum.ProcessName:
                        processes = GetProcessesByName(processName, fromUser, userName);
                        break;
                    case SpecifyProcessByEnum.ProcessId:
                        processes = GetProcessesById(processId, fromUser, userName);
                        break;
                    default:
                        throw new NotSupportedException($"Unsupported specify process by option: {specifyProcessBy}");
                }

                var terminatedCount = 0;

                foreach (var process in processes ?? Enumerable.Empty<Process>())
                    try
                    {
                        if (!process.HasExited) // Avoid killing already exited processes
                        {
                            process.Kill();
                            terminatedCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        status = $"Error terminating process: {ex.Message}";
                    }

                StatusMessage.Set(context, $"Terminated {terminatedCount} processes.");
            }
            catch (Exception ex)
            {
                status = $"Error terminating process: {ex.Message}";
                StatusMessages.Set(context, status);
            }
        }

        // Helper method to get processes by name with optional user filtering
        private static IEnumerable<Process> GetProcessesByName(string processName, bool fromUser, string userName)
        {
            var processes = Process.GetProcessesByName(processName);

            if (!fromUser || string.IsNullOrEmpty(userName)) return processes;

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

        // Helper method to get processes by ID with optional user filtering
        private static IEnumerable<Process> GetProcessesById(int processId, bool fromUser, string userName)
        {
            var result = new List<Process>();

            try
            {
                var process = Process.GetProcessById(processId);

                if (!fromUser || string.IsNullOrEmpty(userName))
                {
                    result.Add(process);
                }
                else
                {
                    var owner = GetProcessOwner(processId);
                    if (owner?.Equals(userName, StringComparison.OrdinalIgnoreCase) == true) result.Add(process);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting process by ID: {ex.Message}");
            }

            return result;
        }

        // Helper method to get the owner of a process using WMI
        private static string GetProcessOwner(int processId)
        {
            try
            {
                var query = $@"SELECT * FROM Win32_Process WHERE ProcessId={processId}";
                var searcher = new ManagementObjectSearcher(query);
                foreach (ManagementObject obj in searcher.Get())
                {
                    var args = new object[] { null };
                    if ((uint)obj.InvokeMethod("GetOwner", args) == 0) return args[0] as string;
                }
            }
            catch
            {
                // Handle exceptions gracefully
            }

            return null;
        }

        // Enum
        public enum SpecifyProcessByEnum
        {
            [Display(Name = "Process Name", Description = "Identifies the process by its name (e.g., notepad).")]
            ProcessName,

            [Display(Name = "Process ID", Description = "Identifies the process by its unique numeric ID.")]
            ProcessId
        }
    }
}