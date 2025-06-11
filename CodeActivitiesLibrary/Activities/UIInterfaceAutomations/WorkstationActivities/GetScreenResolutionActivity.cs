using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Get Screen Resolution")]
    [Description("Gets the width, height, bit depth, and refresh rate of one or all monitors.")]
    public class GetScreenResolutionActivity : BaseCodeActivity
    {
        [DisplayName("Monitor Selection")]
        [Description("Specify whether to get info for primary, all, or a specific monitor")]
        [DefaultValue(MonitorSelectionEnum.Primary)]
        public InArgument<MonitorSelectionEnum> Selection { get; set; }


        [DisplayName("Monitor Index")]
        [Description("Zero-based index of monitor to check (only used when Selection = SpecificIndex)")]
        [RenderIfCondition(nameof(Selection), MonitorSelectionEnum.SpecificIndex)]
        public InArgument<int> MonitorIndex { get; set; }


        [DisplayName("Screen Details")]
        [Description("Returns the screen resolution details.")]
        [RenderIfCondition(nameof(Selection), MonitorSelectionEnum.All)]
        public OutArgument<ScreenResolution[]> ScreenDetails { get; set; }


        [DisplayName("Screen Details")]
        [Description("Returns the screen resolution details.")]
        [RenderIfCondition(nameof(Selection), MonitorSelectionEnum.Primary)]
        [RenderIfCondition(nameof(Selection), MonitorSelectionEnum.SpecificIndex)]
        public OutArgument<ScreenResolution> ScreenDetail { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var selection = Selection.Get(context);
            var monitorIndex = MonitorIndex.Get(context);
            var status = string.Empty;

            try
            {
                var screens = Screen.AllScreens;
                ScreenResolution[] results;
                if (screens == null || screens.Length == 0)
                {
                    throw new InvalidOperationException("No displays detected");
                }

                switch (selection)
                {
                    case MonitorSelectionEnum.Primary:
                        results = new ScreenResolution[1];
                        results[0] = GetScreenInfo(Screen.PrimaryScreen);
                        break;

                    case MonitorSelectionEnum.SpecificIndex:
                        if (monitorIndex < 0 || monitorIndex >= screens.Length)
                        {
                            throw new ArgumentOutOfRangeException(
                                $"Monitor index must be between 0 and {screens.Length - 1}");
                        }

                        results = new ScreenResolution[1];
                        results[0] = GetScreenInfo(screens[monitorIndex]);
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
            }
            catch (Exception ex)
            {
                status = $"Error getting screen resolution: {ex.Message}";
                ScreenDetails.Set(context, null);
            }

            StatusMessage.Set(context, status);
        }

        private ScreenResolution GetScreenInfo(Screen screen)
        {
            var deviceContext = NativeMethods.CreateDC(screen.DeviceName, null, null, IntPtr.Zero);
            if (deviceContext == IntPtr.Zero)
            {
                throw new System.ComponentModel.Win32Exception();
            }

            try
            {
                var bitsPerPixel = NativeMethods.GetDeviceCaps(deviceContext, NativeMethods.BITSPIXEL);
                var refreshRate = NativeMethods.GetDeviceCaps(deviceContext, NativeMethods.VREFRESH);

                return new ScreenResolution
                {
                    DeviceName = screen.DeviceName,
                    Width = screen.Bounds.Width,
                    Height = screen.Bounds.Height,
                    BitDepth = bitsPerPixel,
                    RefreshRate = refreshRate,
                    IsPrimary = screen.Primary,
                    WorkingArea = new Rectangle
                    {
                        X = screen.WorkingArea.X,
                        Y = screen.WorkingArea.Y,
                        Width = screen.WorkingArea.Width,
                        Height = screen.WorkingArea.Height
                    }
                };
            }
            finally
            {
                NativeMethods.DeleteDC(deviceContext);
            }
        }

        public class ScreenResolution
        {
            [DisplayName("Device Name")] public string DeviceName { get; set; }

            [DisplayName("Width (pixels)")] public int Width { get; set; }

            [DisplayName("Height (pixels)")] public int Height { get; set; }

            [DisplayName("Color Depth (bits)")] public int BitDepth { get; set; }

            [DisplayName("Refresh Rate (Hz)")] public int RefreshRate { get; set; }

            [DisplayName("Primary Monitor")] public bool IsPrimary { get; set; }

            [DisplayName("Working Area")] public Rectangle WorkingArea { get; set; }
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
            public const int BITSPIXEL = 12;
            public const int VREFRESH = 116;

            [DllImport("gdi32.dll", CharSet = CharSet.Auto)]
            public static extern int GetDeviceCaps(IntPtr hdc, int nIndex);

            [DllImport("gdi32.dll", CharSet = CharSet.Auto)]
            public static extern IntPtr CreateDC(string lpszDriver, string lpszDevice, string lpszOutput,
                IntPtr lpInitData);

            [DllImport("gdi32.dll", CharSet = CharSet.Auto)]
            public static extern bool DeleteDC(IntPtr hdc);
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
}