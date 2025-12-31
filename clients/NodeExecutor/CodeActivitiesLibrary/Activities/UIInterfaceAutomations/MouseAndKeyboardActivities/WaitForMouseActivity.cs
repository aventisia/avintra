using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;
using System.Threading;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities
{
    [DisplayName("Wait for Mouse")]
    [Description("Suspends the execution of the flow until the mouse pointer changes to or from the specified cursor.")]
    [ActivityMetaData(nodeImg: "/assets/MouseAndKeyboard.svg")]
    public class WaitForMouseActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Wait for Mouse Pointer To")]
        [Description("Specifies whether to wait until the mouse pointer becomes or stops being the specified type.")]
        public InArgument<WaitActionEnum> WaitAction { get; set; }

        [RequiredArgument]
        [DisplayName("Mouse Pointer")]
        [Description("The type of mouse pointer to wait for (e.g., Arrow, Hourglass).")]
        public InArgument<CursorTypeEnum> CursorType { get; set; }


        [DisplayName("Fail with Timeout Error")]
        [Description("If true, throws an error if the timeout is reached without the expected cursor change.")]
        public InArgument<bool> FailWithTimeoutError { get; set; }


        [DisplayName("Duration")]
        [Description("Maximum time in seconds to wait for the cursor change.")]
        [DefaultValue(5)]
        public InArgument<int> TimeoutSeconds { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";
            try
            {
                var waitAction = WaitAction.Get(context);
                var cursorType = CursorType.Get(context);
                var failOnError = FailWithTimeoutError.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

                if (timeout.TotalSeconds <= 0)
                    throw new ArgumentException("Timeout must be greater than zero.");

                // Convert cursor type to system cursor ID
                var cursorId = GetCursorId(cursorType);

                // Start waiting for the cursor change
                var success = false;

                switch (waitAction)
                {
                    case WaitActionEnum.Become:
                        success = WaitForCursorChangeTo(cursorId, timeout);
                        break;

                    case WaitActionEnum.BecomeNot:
                        success = WaitForCursorChangeFrom(cursorId, timeout);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(waitAction));
                }

                if (!success && failOnError)
                    throw new TimeoutException(
                        $"Timeout exceeded while waiting for cursor to {waitAction} '{cursorType}'.");

                status = $"Successfully waited for cursor to {waitAction} '{cursorType}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error waiting for cursor: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }

        private static uint GetCursorId(CursorTypeEnum cursorType)
        {
            switch (cursorType)
            {
                case CursorTypeEnum.Arrow:
                    return NativeMethods.IDC_ARROW;
                case CursorTypeEnum.AppStarting:
                    return NativeMethods.IDC_APPSTARTING;
                case CursorTypeEnum.Cross:
                    return NativeMethods.IDC_CROSS;
                case CursorTypeEnum.Hand:
                    return NativeMethods.IDC_HAND;
                case CursorTypeEnum.Help:
                    return NativeMethods.IDC_HELP;
                case CursorTypeEnum.IBeam:
                    return NativeMethods.IDC_IBEAM;
                case CursorTypeEnum.WaitCursor:
                    return NativeMethods.IDC_WAIT;
                default:
                    throw new ArgumentOutOfRangeException(nameof(cursorType));
            }
        }

        private static bool WaitForCursorChangeTo(uint targetCursorId, TimeSpan timeout)
        {
            var startTime = DateTime.Now;
            while (DateTime.Now - startTime < timeout)
            {
                if (GetActiveCursor() == targetCursorId)
                    return true;

                Thread.Sleep(100); // Check every 100ms
            }

            return false;
        }

        private static bool WaitForCursorChangeFrom(uint targetCursorId, TimeSpan timeout)
        {
            var startTime = DateTime.Now;
            while (DateTime.Now - startTime < timeout)
            {
                if (GetActiveCursor() != targetCursorId)
                    return true;

                Thread.Sleep(100); // Check every 100ms
            }

            return false;
        }

        private static uint GetActiveCursor()
        {
            var hDC = NativeMethods.GetDC(IntPtr.Zero);
            var currentCursorId = NativeMethods.GetClassLong(hDC, NativeMethods.GCL_HCURSOR);
            NativeMethods.ReleaseDC(IntPtr.Zero, hDC);
            return currentCursorId;
        }

        private static class NativeMethods
        {
            [DllImport("user32.dll", SetLastError = true)]
            public static extern IntPtr GetDC(IntPtr hWnd);

            [DllImport("user32.dll", SetLastError = true)]
            public static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);

            [DllImport("user32.dll", SetLastError = true)]
            public static extern uint GetClassLong(IntPtr hWnd, int nIndex);

            public const int GCL_HCURSOR = -12;
            public const uint IDC_ARROW = 32512;
            public const uint IDC_APPSTARTING = 32650;
            public const uint IDC_CROSS = 32515;
            public const uint IDC_HAND = 32649;
            public const uint IDC_HELP = 32651;
            public const uint IDC_IBEAM = 32513;
            public const uint IDC_WAIT = 32514;
        }
    }

    public enum WaitActionEnum
    {
        [Display(Name = "Become", Description = "Waits until the mouse pointer becomes the specified type.")]
        Become,

        [Display(Name = "Become Not", Description = "Waits until the mouse pointer stops being the specified type.")]
        BecomeNot
    }

    public enum CursorTypeEnum
    {
        [Display(Name = "Arrow", Description = "Standard arrow cursor.")]
        Arrow,

        [Display(Name = "App starting", Description = "Hourglass cursor indicating application startup.")]
        AppStarting,

        [Display(Name = "Cross", Description = "Crosshair cursor.")]
        Cross,

        [Display(Name = "Hand", Description = "Hand cursor typically used for links.")]
        Hand,

        [Display(Name = "Help", Description = "Help cursor often used for tooltips.")]
        Help,

        [Display(Name = "I-Beam", Description = "Vertical bar cursor used in text fields.")]
        IBeam,

        [Display(Name = "Wait cursor", Description = "Hourglass cursor indicating a process is ongoing.")]
        WaitCursor
    }
}