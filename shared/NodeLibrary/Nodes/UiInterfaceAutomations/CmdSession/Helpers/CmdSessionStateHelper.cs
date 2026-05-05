using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace NodeLibrary.CmdSessionNodes.Helpers;

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
        if (process == null)
        {
            return;
        }

        var buffer = GetBuffer(process);

        process.OutputDataReceived += (_, args) =>
        {
            if (!string.IsNullOrEmpty(args.Data))
            {
                lock (buffer)
                {
                    buffer.AppendLine(args.Data);
                }
            }
        };

        process.ErrorDataReceived += (_, args) =>
        {
            if (!string.IsNullOrEmpty(args.Data))
            {
                lock (buffer)
                {
                    buffer.AppendLine($"[ERROR] {args.Data}");
                }
            }
        };
    }
}
