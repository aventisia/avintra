using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.CMDSessionActivities.Helpers
{
    public static class CmdSessionStateHelper
    {
        private static readonly ConditionalWeakTable<Process, StringBuilder> _outputBuffers =
            new ConditionalWeakTable<Process, StringBuilder>();

        public static StringBuilder GetBuffer(Process process)
        {
            return _outputBuffers.GetOrCreateValue(process);
        }

        public static void AttachOutputCapture(Process process)
        {
            if (process == null) return;

            var buffer = GetBuffer(process);

            process.OutputDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    lock (buffer)
                        buffer.AppendLine(args.Data);
                }
            };

            process.ErrorDataReceived += (sender, args) =>
            {
                if (!string.IsNullOrEmpty(args.Data))
                {
                    lock (buffer)
                        buffer.AppendLine($"[ERROR] {args.Data}");
                }
            };
        }
    }
}
