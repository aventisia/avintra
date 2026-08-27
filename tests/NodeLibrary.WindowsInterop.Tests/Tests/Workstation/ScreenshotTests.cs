using System.Drawing;
using System.Drawing.Imaging;
using System.Windows.Forms;

namespace NodeLibrary.WindowsInterop.Tests.Tests.Workstation;

public class TakeScreenshotTest : IInteropTest
{
    public string Name => "Take primary screen screenshot";
    public string Category => "Workstation";

    public Task<InteropTestResult> RunAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var screen = Screen.PrimaryScreen;
            if (screen is null)
            {
                return Task.FromResult(new InteropTestResult(false, "No primary screen found."));
            }

            var bounds = screen.Bounds;
            using var bitmap = new Bitmap(bounds.Width, bounds.Height, PixelFormat.Format32bppArgb);
            using var graphics = Graphics.FromImage(bitmap);
            graphics.CopyFromScreen(bounds.Location, Point.Empty, bounds.Size);

            var tempPath = Path.Combine(Path.GetTempPath(), $"interop-screenshot-{Guid.NewGuid():N}.png");
            bitmap.Save(tempPath, ImageFormat.Png);

            return Task.FromResult(new InteropTestResult(
                true,
                $"Screenshot saved to {tempPath} ({bounds.Width}x{bounds.Height})."));
        }
        catch (Exception ex)
        {
            return Task.FromResult(new InteropTestResult(false, $"Screenshot failed: {ex.Message}"));
        }
    }
}
