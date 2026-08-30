using NodeLibrary.MessageBoxNodes.Enums;
using System.Runtime.InteropServices;

namespace NodeLibrary.MessageBoxNodes;

internal static class MessageBoxInteractionHelpers
{
    private const uint MB_OK = 0x00000000;
    private const uint MB_OKCANCEL = 0x00000001;
    private const uint MB_YESNO = 0x00000004;
    private const uint MB_YESNOCANCEL = 0x00000003;
    private const uint MB_ABORTRETRYIGNORE = 0x00000002;
    private const uint MB_RETRYCANCEL = 0x00000005;

    private const uint MB_ICONINFORMATION = 0x00000040;
    private const uint MB_ICONQUESTION = 0x00000020;
    private const uint MB_ICONWARNING = 0x00000030;
    private const uint MB_ICONERROR = 0x00000010;

    private const uint MB_DEFBUTTON1 = 0x00000000;
    private const uint MB_DEFBUTTON2 = 0x00000100;
    private const uint MB_DEFBUTTON3 = 0x00000200;
    private const uint MB_TOPMOST = 0x00040000;

    private const int IDOK = 1;
    private const int IDCANCEL = 2;
    private const int IDABORT = 3;
    private const int IDRETRY = 4;
    private const int IDIGNORE = 5;
    private const int IDYES = 6;
    private const int IDNO = 7;

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int MessageBoxW(IntPtr hWnd, string text, string caption, uint type);

    // Environment flag set by the service-spawned worker when the --unattended switch is used.
    // In unattended mode we intentionally fail fast for UI-dependent nodes.
    private static readonly bool IsUnattended =
        bool.TryParse(Environment.GetEnvironmentVariable("AVINTRA_UNATTENDED"), out var unattended) && unattended;

    public static bool IsInteractivePromptAvailable()
    {
        if (IsUnattended)
        {
            return false;
        }

        if (!Environment.UserInteractive)
        {
            return false;
        }

        try
        {
            return !Console.IsInputRedirected;
        }
        catch
        {
            return false;
        }
    }

    public static bool TryShowNativeMessage(
        string title,
        string message,
        MessageBoxButtonsEnum buttons,
        MessageBoxIconEnum icon,
        DefaultButtonEnum defaultButton,
        bool keepOnTop,
        out DialogResultEnum dialogResult)
    {
        dialogResult = DialogResultEnum.Cancel;

        if (!OperatingSystem.IsWindows())
        {
            return false;
        }

        var type = ToNativeButtons(buttons) | ToNativeIcon(icon) | ToNativeDefaultButton(defaultButton);
        if (keepOnTop)
        {
            type |= MB_TOPMOST;
        }

        var result = MessageBoxW(IntPtr.Zero, message, title, type);
        dialogResult = MapDialogResult(result, buttons);
        return result != 0;
    }

    public static string? Prompt(string prompt, string? defaultValue = null)
    {
        Console.WriteLine(prompt);
        if (!string.IsNullOrWhiteSpace(defaultValue))
        {
            Console.Write($"[{defaultValue}] ");
        }

        var input = Console.ReadLine();
        if (string.IsNullOrEmpty(input))
        {
            return defaultValue;
        }

        return input;
    }

    public static string PromptPassword(string prompt, string? defaultValue = null)
    {
        Console.WriteLine(prompt);
        if (!string.IsNullOrWhiteSpace(defaultValue))
        {
            Console.Write("[Press Enter to keep default] ");
        }

        var buffer = new StringBuilder();
        while (true)
        {
            var key = Console.ReadKey(intercept: true);
            if (key.Key == ConsoleKey.Enter)
            {
                Console.WriteLine();
                break;
            }

            if (key.Key == ConsoleKey.Backspace)
            {
                if (buffer.Length > 0)
                {
                    buffer.Length -= 1;
                    Console.Write("\b \b");
                }

                continue;
            }

            if (char.IsControl(key.KeyChar))
            {
                continue;
            }

            buffer.Append(key.KeyChar);
            Console.Write("*");
        }

        if (buffer.Length == 0 && !string.IsNullOrEmpty(defaultValue))
        {
            return defaultValue;
        }

        return buffer.ToString();
    }

    public static List<int> ParseSelectedIndices(string? input, int maxIndex)
    {
        var output = new List<int>();
        if (string.IsNullOrWhiteSpace(input))
        {
            return output;
        }

        var tokens = input.Split(',', ';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        foreach (var token in tokens)
        {
            if (!int.TryParse(token, out var index))
            {
                continue;
            }

            if (index < 1 || index > maxIndex)
            {
                continue;
            }

            var zeroBased = index - 1;
            if (!output.Contains(zeroBased))
            {
                output.Add(zeroBased);
            }
        }

        return output;
    }

    public static List<string> ParsePathList(string? input, bool allowMultiple)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return [];
        }

        if (!allowMultiple)
        {
            return [input.Trim()];
        }

        return input
            .Split(new[] { ',', ';', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static uint ToNativeButtons(MessageBoxButtonsEnum buttons)
    {
        return buttons switch
        {
            MessageBoxButtonsEnum.OKCancel => MB_OKCANCEL,
            MessageBoxButtonsEnum.YesNo => MB_YESNO,
            MessageBoxButtonsEnum.YesNoCancel => MB_YESNOCANCEL,
            MessageBoxButtonsEnum.AbortRetryIgnore => MB_ABORTRETRYIGNORE,
            MessageBoxButtonsEnum.RetryCancel => MB_RETRYCANCEL,
            _ => MB_OK
        };
    }

    private static uint ToNativeIcon(MessageBoxIconEnum icon)
    {
        return icon switch
        {
            MessageBoxIconEnum.Information => MB_ICONINFORMATION,
            MessageBoxIconEnum.Question => MB_ICONQUESTION,
            MessageBoxIconEnum.Warning => MB_ICONWARNING,
            MessageBoxIconEnum.Error => MB_ICONERROR,
            _ => 0
        };
    }

    private static uint ToNativeDefaultButton(DefaultButtonEnum defaultButton)
    {
        return defaultButton switch
        {
            DefaultButtonEnum.Button2 => MB_DEFBUTTON2,
            DefaultButtonEnum.Button3 => MB_DEFBUTTON3,
            _ => MB_DEFBUTTON1
        };
    }

    private static DialogResultEnum MapDialogResult(int result, MessageBoxButtonsEnum buttons)
    {
        return buttons switch
        {
            MessageBoxButtonsEnum.OK => result switch
            {
                IDOK => DialogResultEnum.OK,
                _ => DialogResultEnum.Cancel
            },
            MessageBoxButtonsEnum.OKCancel => result switch
            {
                IDOK => DialogResultEnum.OK,
                IDCANCEL => DialogResultEnum.Cancel,
                _ => DialogResultEnum.Cancel
            },
            MessageBoxButtonsEnum.YesNo => result switch
            {
                IDYES => DialogResultEnum.Yes,
                IDNO => DialogResultEnum.No,
                _ => DialogResultEnum.Cancel
            },
            MessageBoxButtonsEnum.YesNoCancel => result switch
            {
                IDYES => DialogResultEnum.Yes,
                IDNO => DialogResultEnum.No,
                IDCANCEL => DialogResultEnum.Cancel,
                _ => DialogResultEnum.Cancel
            },
            MessageBoxButtonsEnum.AbortRetryIgnore => result switch
            {
                IDABORT => DialogResultEnum.Abort,
                IDRETRY => DialogResultEnum.Retry,
                IDIGNORE => DialogResultEnum.Ignore,
                _ => DialogResultEnum.Cancel
            },
            MessageBoxButtonsEnum.RetryCancel => result switch
            {
                IDRETRY => DialogResultEnum.Retry,
                IDCANCEL => DialogResultEnum.Cancel,
                _ => DialogResultEnum.Cancel
            },
            _ => MapDialogResultByPosition(result)
        };
    }

    private static DialogResultEnum MapDialogResultByPosition(int result)
    {
        return result switch
        {
            IDOK => DialogResultEnum.OK,
            IDCANCEL => DialogResultEnum.Cancel,
            IDABORT => DialogResultEnum.Abort,
            IDRETRY => DialogResultEnum.Retry,
            IDIGNORE => DialogResultEnum.Ignore,
            IDYES => DialogResultEnum.FirstButton,
            IDNO => DialogResultEnum.SecondButton,
            _ => DialogResultEnum.Cancel
        };
    }
}