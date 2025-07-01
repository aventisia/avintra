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
    [DisplayName("If process")]
    [Description(
        "Marks the beginning of a conditional block of actions depending on whether a process is running or not.")]
    public class IfProcessActivity :BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("If process")]
        [Description("Specifies the condition to check (e.g., IsRunning, Isn't Running).")]
        public InArgument<IfProcessConditionEnum> Condition { get; set; }

        [RequiredArgument]
        [DisplayName("Process name")]
        [Description("The name of the process to check.")]
        public InArgument<ProcessNameEnum> ProcessName { get; set; }


        [DisplayName("From User")]
        [Description("Indicates whether to check if the process is running under a specific user.")]
        public InArgument<bool> FromUser { get; set; }


        [DisplayName("User name")]
        [Description("The name of the user to check (only applicable if 'From User' is enabled).")]
        public InArgument<string> UserName { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var condition = Condition.Get(context);
                var processName = ProcessName.Get(context).ToString(); // Convert enum to string
                var fromUser = FromUser.Get(context);
                var userName = UserName.Get(context);

                // Validate input
                if (string.IsNullOrWhiteSpace(processName))
                    throw new ArgumentException("Process name cannot be empty.");

                var isRunning = false;

                // Check if filtering by user is enabled
                if (fromUser)
                {
                    // Get all processes matching the process name
                    var processes = Process.GetProcessesByName(processName);

                    // Filter processes by the specified user
                    isRunning = processes.Any(p =>
                    {
                        try
                        {
                            // Get the username of the process owner
                            var processOwner = GetProcessOwner(p.Id);
                            return processOwner?.Equals(userName, StringComparison.OrdinalIgnoreCase) == true;
                        }
                        catch
                        {
                            // Ignore errors for individual processes
                            return false;
                        }
                    });
                }
                else
                {
                    // Simply check if any process with the name exists
                    isRunning = Process.GetProcessesByName(processName).Length > 0;
                }

                // Evaluate the condition
                var result = false;
                switch (condition)
                {
                    case IfProcessConditionEnum.IsRunning:
                        result = isRunning;
                        break;
                    case IfProcessConditionEnum.IsntRunning:
                        result = !isRunning;
                        break;
                    default:
                        throw new NotSupportedException($"Unsupported condition: {condition}");
                }

                // Set output arguments
                IsSuccess.Set(context, true);
                StatusMessage.Set(context,
                    $"Process '{processName}' {(result ? "matches" : "does not match")} the condition.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error checking process status: {ex.Message}");
            }

        }

        // Helper method to get the owner of a process
        private static string GetProcessOwner(int processId)
        {
            try
            {
                using (var process = Process.GetProcessById(processId))
                {
                    if (process != null && !string.IsNullOrEmpty(process.MainModule?.FileName))
                    {
                        var processPath = process.MainModule.FileName;
                        // Use WMI to get the owner of the process
                        // Note: This requires appropriate permissions
                        var query = $@"SELECT * FROM Win32_Process WHERE ProcessId={processId}";
                        var searcher = new ManagementObjectSearcher(query);
                        foreach (ManagementObject obj in searcher.Get())
                            if (obj["Caption"] != null && obj["ExecutablePath"]?.ToString() == processPath)
                                return obj["Handle"].ToString();
                    }
                }
            }
            catch
            {
                // Handle exceptions gracefully
            }

            return null;
        }
    }

    // Enum for IfProcess condition
    public enum IfProcessConditionEnum
    {
        [Display(Name = "Is Running", Description = "Checks if the process is currently running.")]
        IsRunning,

        [Display(Name = "Is Not Running", Description = "Checks if the process is not currently running.")]
        IsntRunning
    }
}