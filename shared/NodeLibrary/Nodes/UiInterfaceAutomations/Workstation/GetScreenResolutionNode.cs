using System.Runtime.InteropServices;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Get Screen Resolution"), Description("Gets the width, height, bit depth, and refresh rate of one or all monitors.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class GetScreenResolutionNode : BaseNode
{
    [DisplayName("Monitor Selection"), Description("Specify whether to get info for primary, all, or a specific monitor")]
    public InArgument<MonitorSelectionEnum> Selection { get; set; } = new InArgument<MonitorSelectionEnum>(MonitorSelectionEnum.Primary);

    [DisplayName("Monitor Index"), Description("Zero-based index of monitor to check (only used when Selection = SpecificIndex)")]
    [RenderIfCondition(nameof(Selection), MonitorSelectionEnum.SpecificIndex)]
    public InArgument<int> MonitorIndex { get; set; } = new InArgument<int>(0);

    [DisplayName("Screen Details"), Description("Returns the screen resolution details.")]
    [RenderIfCondition(nameof(Selection), MonitorSelectionEnum.All)]
    public OutArgument<ScreenResolution[]> ScreenDetails { get; set; } = new OutArgument<ScreenResolution[]>();

    [DisplayName("Screen Details"), Description("Returns the screen resolution details.")]
    [RenderIfCondition(nameof(Selection), MonitorSelectionEnum.Primary)]
    [RenderIfCondition(nameof(Selection), MonitorSelectionEnum.SpecificIndex)]
    public OutArgument<ScreenResolution> ScreenDetail { get; set; } = new OutArgument<ScreenResolution>();

    protected override void Execute(INodeContext context)
    {
        var selection = Selection.Get(context);
        var monitorIndex = MonitorIndex.Get(context);
        var status = string.Empty;

        try
        {
            var screens = GetMonitors();
            ScreenResolution[] results;
            if (screens == null || screens.Length == 0)
            {
                throw new InvalidOperationException("No displays detected");
            }

            switch (selection)
            {
                case MonitorSelectionEnum.Primary:
                    var primaryScreen = screens.FirstOrDefault(s => s.IsPrimary) ?? screens[0];
                    results = [GetScreenInfo(primaryScreen)];
                    break;

                case MonitorSelectionEnum.SpecificIndex:
                    if (monitorIndex < 0 || monitorIndex >= screens.Length)
                    {
                        throw new ArgumentOutOfRangeException($"Monitor index must be between 0 and {screens.Length - 1}");
                    }

                    results = [GetScreenInfo(screens[monitorIndex])];
                    break;

                case MonitorSelectionEnum.All:
                    results = new ScreenResolution[screens.Length];
                    for (var i = 0; i < screens.Length; i++)
                    {
                        results[i] = GetScreenInfo(screens[i]);
                    }

                    break;

                default:
                    throw new ArgumentException("Invalid monitor selection option");
            }

            if (selection == MonitorSelectionEnum.Primary || selection == MonitorSelectionEnum.SpecificIndex)
            {
                ScreenDetail.Set(context, results[0]);
            }

            ScreenDetails.Set(context, results);
            status = $"Successfully retrieved {results.Length} screen configuration(s)";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ScreenDetails.Set(context, Array.Empty<ScreenResolution>());
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error getting screen resolution: {ex.Message}");
        }
    }

    private MonitorDetails[] GetMonitors()
    {
        var monitors = new List<MonitorDetails>();
        var gcHandle = GCHandle.Alloc(monitors);

        try
        {
            var success = NativeMethods.EnumDisplayMonitors(
                IntPtr.Zero,
                IntPtr.Zero,
                MonitorEnumProc,
                GCHandle.ToIntPtr(gcHandle));

            if (!success)
            {
                throw new Win32Exception(Marshal.GetLastWin32Error());
            }
        }
        finally
        {
            if (gcHandle.IsAllocated)
            {
                gcHandle.Free();
            }
        }

        return [.. monitors];
    }

    private static bool MonitorEnumProc(IntPtr hMonitor, IntPtr _, ref NativeMethods.Rect __, IntPtr data)
    {
        var handle = GCHandle.FromIntPtr(data);
        if (handle.Target is not List<MonitorDetails> monitors)
        {
            return false;
        }

        var info = NativeMethods.MonitorInfoEx.Create();
        if (!NativeMethods.GetMonitorInfo(hMonitor, ref info))
        {
            return true;
        }

        var hasDisplaySettings = NativeMethods.TryGetCurrentDisplaySettings(info.DeviceName, out var devMode);
        monitors.Add(new MonitorDetails
        {
            DeviceName = info.DeviceName,
            Bounds = info.Monitor,
            WorkingArea = info.Work,
            IsPrimary = (info.Flags & NativeMethods.MONITORINFOF_PRIMARY) != 0,
            BitDepth = hasDisplaySettings ? devMode.dmBitsPerPel : 0,
            RefreshRate = hasDisplaySettings ? (int)devMode.dmDisplayFrequency : 0
        });

        return true;
    }

    private ScreenResolution GetScreenInfo(MonitorDetails screen)
    {
        return new ScreenResolution
        {
            DeviceName = screen.DeviceName,
            Width = screen.Bounds.Right - screen.Bounds.Left,
            Height = screen.Bounds.Bottom - screen.Bounds.Top,
            BitDepth = screen.BitDepth,
            RefreshRate = screen.RefreshRate,
            IsPrimary = screen.IsPrimary,
            WorkingArea = new Rectangle
            {
                X = screen.WorkingArea.Left,
                Y = screen.WorkingArea.Top,
                Width = screen.WorkingArea.Right - screen.WorkingArea.Left,
                Height = screen.WorkingArea.Bottom - screen.WorkingArea.Top
            }
        };
    }

    private sealed class MonitorDetails
    {
        public string DeviceName { get; set; } = string.Empty;

        public NativeMethods.Rect Bounds { get; set; }

        public NativeMethods.Rect WorkingArea { get; set; }

        public bool IsPrimary { get; set; }

        public int BitDepth { get; set; }

        public int RefreshRate { get; set; }
    }

    public class ScreenResolution
    {
        [DisplayName("Device Name")] public string DeviceName { get; set; } = string.Empty;

        [DisplayName("Width (pixels)")] public int Width { get; set; }

        [DisplayName("Height (pixels)")] public int Height { get; set; }

        [DisplayName("Color Depth (bits)")] public int BitDepth { get; set; }

        [DisplayName("Refresh Rate (Hz)")] public int RefreshRate { get; set; }

        [DisplayName("Primary Monitor")] public bool IsPrimary { get; set; }

        [DisplayName("Working Area")] public Rectangle WorkingArea { get; set; } = new Rectangle();
    }

    public class Rectangle
    {
        [DisplayName("X Position")] public int X { get; set; }

        [DisplayName("Y Position")] public int Y { get; set; }

        [DisplayName("Width")] public int Width { get; set; }

        [DisplayName("Height")] public int Height { get; set; }
    }

    private static class NativeMethods
    {
        public const int MONITORINFOF_PRIMARY = 1;
        private const int CCHDEVICENAME = 32;
        private const int ENUM_CURRENT_SETTINGS = -1;

        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool EnumDisplayMonitors(
            IntPtr hdc,
            IntPtr lprcClip,
            MonitorEnumProc lpfnEnum,
            IntPtr dwData);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern bool GetMonitorInfo(IntPtr hMonitor, ref MonitorInfoEx lpmi);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool EnumDisplaySettings(string? lpszDeviceName, int iModeNum, ref DevMode lpDevMode);

        public static bool TryGetCurrentDisplaySettings(string deviceName, out DevMode devMode)
        {
            devMode = new DevMode();
            devMode.dmSize = (short)Marshal.SizeOf<DevMode>();
            return EnumDisplaySettings(deviceName, ENUM_CURRENT_SETTINGS, ref devMode);
        }

        public delegate bool MonitorEnumProc(IntPtr hMonitor, IntPtr hdcMonitor, ref Rect lprcMonitor, IntPtr dwData);

        [StructLayout(LayoutKind.Sequential)]
        public struct Rect
        {
            public int Left;
            public int Top;
            public int Right;
            public int Bottom;
        }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        public struct MonitorInfoEx
        {
            public int Size;
            public Rect Monitor;
            public Rect Work;
            public int Flags;

            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = CCHDEVICENAME)]
            public string DeviceName;

            public static MonitorInfoEx Create()
            {
                return new MonitorInfoEx
                {
                    Size = Marshal.SizeOf<MonitorInfoEx>(),
                    DeviceName = string.Empty
                };
            }
        }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
        public struct DevMode
        {
            private const int CCHDEVICENAME = 32;
            private const int CCHFORMNAME = 32;

            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = CCHDEVICENAME)]
            public string dmDeviceName;

            public short dmSpecVersion;
            public short dmDriverVersion;
            public short dmSize;
            public short dmDriverExtra;
            public int dmFields;
            public int dmPositionX;
            public int dmPositionY;
            public int dmDisplayOrientation;
            public int dmDisplayFixedOutput;
            public short dmColor;
            public short dmDuplex;
            public short dmYResolution;
            public short dmTTOption;
            public short dmCollate;

            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = CCHFORMNAME)]
            public string dmFormName;

            public short dmLogPixels;
            public int dmBitsPerPel;
            public int dmPelsWidth;
            public int dmPelsHeight;
            public int dmDisplayFlags;
            public int dmDisplayFrequency;
            public int dmICMMethod;
            public int dmICMIntent;
            public int dmMediaType;
            public int dmDitherType;
            public int dmReserved1;
            public int dmReserved2;
            public int dmPanningWidth;
            public int dmPanningHeight;
        }
    }

    public enum MonitorSelectionEnum
    {
        [Display(Name = "Primary Monitor", Description = "Get resolution of the primary monitor.")]
        Primary,
        [Display(Name = "All Monitors", Description = "Get resolution of all connected monitors.")]
        All,
        [Display(Name = "Specific Monitor Index", Description = "Get resolution of a specific monitor by index.")]
        SpecificIndex
    }
}
