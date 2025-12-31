using System.Windows;
using System.Windows.Forms;
using System.Windows.Media;

namespace NodeExecutor.Services
{
    public static class WindowPositionService
    {
        public static void PositionBottomRight(Window window)
        {
            // Window is null, return
            if (window == null) return;

            // Ensure the window is loaded and has a presentation source
            var source = PresentationSource.FromVisual(window);

            // Source is null, return
            if (source?.CompositionTarget == null) return;

            // Get screen working area (in physical pixels)
            var screen = Screen.PrimaryScreen;
            var workingArea = screen.WorkingArea;

            // Calculate the DPI scale factor
            Matrix transformToDevice = source.CompositionTarget.TransformFromDevice;

            // Convert screen pixels to WPF units (DIPs)
            Point bottomRightDip = transformToDevice.Transform(new Point(workingArea.Right, workingArea.Bottom));

            // Position the window
            window.Left = bottomRightDip.X - window.Width;
            window.Top = bottomRightDip.Y - window.Height;

        }
    }
}