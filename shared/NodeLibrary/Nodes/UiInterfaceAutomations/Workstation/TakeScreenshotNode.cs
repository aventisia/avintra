using System.Drawing;
using System.Runtime.InteropServices;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Take Screenshot"), Description("Takes a screenshot of all screens, primary screen, or a specific screen and saves it to clipboard or file.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class TakeScreenshotNode : BaseNode
{
    [DisplayName("Capture"), Description("Specifies which part of the screen to capture.")]
    public required InArgument<CaptureModeEnum> CaptureMode { get; set; }

    [DisplayName("Screen to Capture"), Description("The handle of the screen/window to capture (required if 'Capture' is 'Select screen').")]
    [RenderIfCondition(nameof(CaptureMode), CaptureModeEnum.SelectScreen)]
    public InArgument<IntPtr> ScreenToCapture { get; set; } = new InArgument<IntPtr>(IntPtr.Zero);

    [DisplayName("Save Screenshot To"), Description("Specifies where to save the screenshot.")]
    public InArgument<SaveModeEnum> SaveMode { get; set; } = new InArgument<SaveModeEnum>(SaveModeEnum.Clipboard);

    [DisplayName("Image File Path"), Description("The path to save the screenshot file (required if 'Save Screenshot To' is 'File').")]
    [RenderIfCondition(nameof(SaveMode), SaveModeEnum.File)]
    public InArgument<string> ImageFilePath { get; set; } = new InArgument<string>(string.Empty);

    [DisplayName("Image Format"), Description("The format in which to save the screenshot (required if 'Save Screenshot To' is 'File').")]
    [RenderIfCondition(nameof(SaveMode), SaveModeEnum.File)]
    public InArgument<ImageFormatEnum> ImageFormat { get; set; } = new InArgument<ImageFormatEnum>(ImageFormatEnum.BMP);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var captureMode = CaptureMode.Get(context);
            var screenToCapture = ScreenToCapture.Get(context);
            var saveMode = SaveMode.Get(context);
            var imageFilePath = ImageFilePath.Get(context) ?? string.Empty;
            var imageFormat = ImageFormat.Get(context);

            switch (captureMode)
            {
                case CaptureModeEnum.AllScreens:
                    CaptureAllScreens(saveMode, imageFilePath, imageFormat);
                    break;

                case CaptureModeEnum.PrimaryScreen:
                    CapturePrimaryScreen(saveMode, imageFilePath, imageFormat);
                    break;

                case CaptureModeEnum.SelectScreen:
                    CaptureSpecificScreen(screenToCapture, saveMode, imageFilePath, imageFormat);
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(captureMode));
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error taking screenshot: {ex.Message}");
        }
    }

    private static void CaptureAllScreens(SaveModeEnum saveMode, string imageFilePath, ImageFormatEnum imageFormat)
    {
        var monitors = GetMonitors();
        if (monitors.Count == 0)
        {
            throw new InvalidOperationException("No displays detected.");
        }

        var bounds = monitors
            .Select(m => m.Monitor)
            .Aggregate(UnionRects);

        using var bitmap = new Bitmap(bounds.Width, bounds.Height);
        using var memoryGraphics = Graphics.FromImage(bitmap);

        memoryGraphics.CopyFromScreen(bounds.Location, Point.Empty, bounds.Size);
        SaveBitmap(bitmap, saveMode, imageFilePath, imageFormat);
    }

    private static void CapturePrimaryScreen(SaveModeEnum saveMode, string imageFilePath, ImageFormatEnum imageFormat)
    {
        var monitor = GetMonitors().FirstOrDefault(m => m.IsPrimary);
        if (monitor is null)
        {
            throw new InvalidOperationException("Primary monitor not found.");
        }

        if (monitor.Monitor.Width == 0 || monitor.Monitor.Height == 0)
        {
            throw new InvalidOperationException("Primary monitor not found.");
        }

        var bounds = monitor.Monitor;
        using var bitmap = new Bitmap(bounds.Width, bounds.Height);
        using var memoryGraphics = Graphics.FromImage(bitmap);

        memoryGraphics.CopyFromScreen(bounds.Location, Point.Empty, bounds.Size);
        SaveBitmap(bitmap, saveMode, imageFilePath, imageFormat);
    }

    private static void CaptureSpecificScreen(IntPtr screenHandle, SaveModeEnum saveMode, string imageFilePath, ImageFormatEnum imageFormat)
    {
        if (screenHandle == IntPtr.Zero)
        {
            throw new ArgumentException("Screen handle cannot be zero when capture mode is Select screen.");
        }

        var monitorHandle = NativeMethods.MonitorFromWindow(screenHandle, NativeMethods.MONITOR_DEFAULTTONEAREST);
        if (monitorHandle == IntPtr.Zero)
        {
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Unable to resolve monitor from the provided window handle.");
        }

        var monitor = GetMonitorByHandle(monitorHandle)
            ?? throw new InvalidOperationException("Unable to resolve monitor details for the provided handle.");

        var bounds = monitor.Monitor;
        using var bitmap = new Bitmap(bounds.Width, bounds.Height);
        using var memoryGraphics = Graphics.FromImage(bitmap);

        memoryGraphics.CopyFromScreen(bounds.Location, Point.Empty, bounds.Size);
        SaveBitmap(bitmap, saveMode, imageFilePath, imageFormat);
    }

    private static void SaveBitmap(Bitmap bitmap, SaveModeEnum saveMode, string imageFilePath, ImageFormatEnum imageFormat)
    {
        switch (saveMode)
        {
            case SaveModeEnum.Clipboard:
                SetImageToClipboard(bitmap);
                break;

            case SaveModeEnum.File when string.IsNullOrWhiteSpace(imageFilePath):
                throw new ArgumentException("Image file path cannot be null or empty.");

            case SaveModeEnum.File:
                bitmap.Save(imageFilePath, GetImageFormat(imageFormat));
                break;

            default:
                throw new ArgumentOutOfRangeException(nameof(saveMode));
        }
    }

    private static List<MonitorInfo> GetMonitors()
    {
        var monitors = new List<MonitorInfo>();
        var handle = GCHandle.Alloc(monitors);

        try
        {
            var ok = NativeMethods.EnumDisplayMonitors(IntPtr.Zero, IntPtr.Zero, MonitorEnumProc, GCHandle.ToIntPtr(handle));
            if (!ok)
            {
                throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to enumerate monitors.");
            }
        }
        finally
        {
            if (handle.IsAllocated)
            {
                handle.Free();
            }
        }

        return monitors;
    }

    private static MonitorInfo? GetMonitorByHandle(IntPtr hMonitor)
    {
        var infoEx = NativeMethods.MonitorInfoEx.Create();
        if (!NativeMethods.GetMonitorInfo(hMonitor, ref infoEx))
        {
            return null;
        }

        return new MonitorInfo
        {
            Handle = hMonitor,
            Monitor = ToRectangle(infoEx.Monitor),
            IsPrimary = (infoEx.Flags & NativeMethods.MONITORINFOF_PRIMARY) != 0
        };
    }

    private static bool MonitorEnumProc(IntPtr hMonitor, IntPtr _, ref NativeMethods.Rect __, IntPtr data)
    {
        var gcHandle = GCHandle.FromIntPtr(data);
        if (gcHandle.Target is not List<MonitorInfo> monitors)
        {
            return false;
        }

        var infoEx = NativeMethods.MonitorInfoEx.Create();
        if (!NativeMethods.GetMonitorInfo(hMonitor, ref infoEx))
        {
            return true;
        }

        monitors.Add(new MonitorInfo
        {
            Handle = hMonitor,
            Monitor = ToRectangle(infoEx.Monitor),
            IsPrimary = (infoEx.Flags & NativeMethods.MONITORINFOF_PRIMARY) != 0
        });

        return true;
    }

    private static Rectangle ToRectangle(NativeMethods.Rect rect)
    {
        return new Rectangle(
            rect.Left,
            rect.Top,
            rect.Right - rect.Left,
            rect.Bottom - rect.Top);
    }

    private static Rectangle UnionRects(Rectangle a, Rectangle b)
    {
        var left = Math.Min(a.Left, b.Left);
        var top = Math.Min(a.Top, b.Top);
        var right = Math.Max(a.Right, b.Right);
        var bottom = Math.Max(a.Bottom, b.Bottom);

        return new Rectangle(left, top, right - left, bottom - top);
    }

    private static void SetImageToClipboard(Bitmap bitmap)
    {
        using var stream = new MemoryStream();
        bitmap.Save(stream, System.Drawing.Imaging.ImageFormat.Bmp);
        var bmpBytes = stream.ToArray();

        if (bmpBytes.Length <= 14)
        {
            throw new InvalidOperationException("Unexpected bitmap data for clipboard operation.");
        }

        var dibSize = bmpBytes.Length - 14;
        var hGlobal = NativeMethods.GlobalAlloc(NativeMethods.GMEM_MOVEABLE, (UIntPtr)dibSize);
        if (hGlobal == IntPtr.Zero)
        {
            throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to allocate global memory for clipboard image.");
        }

        var keepOwnershipForClipboard = false;
        try
        {
            var ptr = NativeMethods.GlobalLock(hGlobal);
            if (ptr == IntPtr.Zero)
            {
                throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to lock global memory for clipboard image.");
            }

            try
            {
                Marshal.Copy(bmpBytes, 14, ptr, dibSize);
            }
            finally
            {
                NativeMethods.GlobalUnlock(hGlobal);
            }

            if (!NativeMethods.OpenClipboard(IntPtr.Zero))
            {
                throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to open clipboard.");
            }

            try
            {
                if (!NativeMethods.EmptyClipboard())
                {
                    throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to clear clipboard.");
                }

                var setResult = NativeMethods.SetClipboardData(NativeMethods.CF_DIB, hGlobal);
                if (setResult == IntPtr.Zero)
                {
                    throw new Win32Exception(Marshal.GetLastWin32Error(), "Failed to set clipboard image data.");
                }

                keepOwnershipForClipboard = true;
            }
            finally
            {
                NativeMethods.CloseClipboard();
            }
        }
        finally
        {
            if (!keepOwnershipForClipboard && hGlobal != IntPtr.Zero)
            {
                NativeMethods.GlobalFree(hGlobal);
            }
        }
    }

    private static System.Drawing.Imaging.ImageFormat GetImageFormat(ImageFormatEnum format)
    {
        switch (format)
        {
            case ImageFormatEnum.BMP:
                return System.Drawing.Imaging.ImageFormat.Bmp;
            case ImageFormatEnum.GIF:
                return System.Drawing.Imaging.ImageFormat.Gif;
            case ImageFormatEnum.JPG:
                return System.Drawing.Imaging.ImageFormat.Jpeg;
            case ImageFormatEnum.PNG:
                return System.Drawing.Imaging.ImageFormat.Png;
            case ImageFormatEnum.TIFF:
                return System.Drawing.Imaging.ImageFormat.Tiff;
            default:
                throw new ArgumentOutOfRangeException(nameof(format));
        }
    }

    private sealed class MonitorInfo
    {
        public IntPtr Handle { get; set; }

        public Rectangle Monitor { get; set; }

        public bool IsPrimary { get; set; }
    }

    private static class NativeMethods
    {
        public const int MONITOR_DEFAULTTONEAREST = 2;
        public const int MONITORINFOF_PRIMARY = 1;
        public const uint CF_DIB = 8;
        public const uint GMEM_MOVEABLE = 0x0002;
        private const int CCHDEVICENAME = 32;

        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool EnumDisplayMonitors(
            IntPtr hdc,
            IntPtr lprcClip,
            MonitorEnumProc lpfnEnum,
            IntPtr dwData);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern bool GetMonitorInfo(IntPtr hMonitor, ref MonitorInfoEx lpmi);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern IntPtr MonitorFromWindow(IntPtr hwnd, int dwFlags);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool OpenClipboard(IntPtr hWndNewOwner);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool CloseClipboard();

        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool EmptyClipboard();

        [DllImport("user32.dll", SetLastError = true)]
        public static extern IntPtr SetClipboardData(uint uFormat, IntPtr hMem);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern IntPtr GlobalAlloc(uint uFlags, UIntPtr dwBytes);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern IntPtr GlobalLock(IntPtr hMem);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool GlobalUnlock(IntPtr hMem);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern IntPtr GlobalFree(IntPtr hMem);

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
    }
}

public enum CaptureModeEnum
{
    [Display(Name = "All screens", Description = "Captures all available screens.")]
    AllScreens,

    [Display(Name = "Primary screen", Description = "Captures only the primary screen.")]
    PrimaryScreen,

    [Display(Name = "Select screen", Description = "Captures a specific screen/window by handle.")]
    SelectScreen
}

public enum SaveModeEnum
{
    [Display(Name = "Clipboard", Description = "Saves the screenshot to the clipboard.")]
    Clipboard,

    [Display(Name = "File", Description = "Saves the screenshot to a file.")]
    File
}

public enum ImageFormatEnum
{
    [Display(Name = "BMP", Description = "Bitmap format.")]
    BMP,

    [Display(Name = "GIF", Description = "GIF format.")]
    GIF,

    [Display(Name = "JPG", Description = "JPEG format.")]
    JPG,

    [Display(Name = "PNG", Description = "Portable Network Graphics format.")]
    PNG,

    [Display(Name = "TIFF", Description = "Tagged Image File Format.")]
    TIFF
}
