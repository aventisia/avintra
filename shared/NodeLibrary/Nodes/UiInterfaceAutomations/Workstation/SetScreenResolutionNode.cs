using System.Runtime.InteropServices;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Set Screen Resolution"), Description("Sets the width, height, bit count, and frequency of a selected monitor.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class SetScreenResolutionNode : BaseNode
{
    private const int CdsUpdateregistry = 0x01;

    [DisplayName("Display"), Description("The name or number of the display to set resolution for. Use 'Primary' for the primary monitor, or 'All' for all monitors.")]
    public required InArgument<string> Display { get; set; }

    [DisplayName("Width"), Description("The width of the screen.")]
    public required InArgument<int> Width { get; set; }

    [DisplayName("Height"), Description("The height of the screen.")]
    public required InArgument<int> Height { get; set; }

    [DisplayName("Bit Count"), Description("The bit count of the screen.")]
    public required InArgument<int> BitCount { get; set; }

    [DisplayName("Frequency"), Description("The frequency (refresh rate) of the screen.")]
    public required InArgument<int> Frequency { get; set; }

    protected override void Execute(INodeContext context)
    {
        var display = Display.Get(context);
        var width = Width.Get(context);
        var height = Height.Get(context);
        var bitCount = BitCount.Get(context);
        var frequency = Frequency.Get(context);
        var status = string.Empty;

        try
        {
            if (string.IsNullOrWhiteSpace(display))
            {
                throw new ArgumentException("Display name or number cannot be empty.");
            }

            var devMode = new Devmode
            {
                dmSize = (short)Marshal.SizeOf(typeof(Devmode)),
                dmPelsWidth = width,
                dmPelsHeight = height,
                dmBitsPerPel = bitCount,
                dmDisplayFrequency = frequency
            };

            var result = ChangeDisplaySettingsEx(display, ref devMode, IntPtr.Zero, CdsUpdateregistry, IntPtr.Zero);
            if (result != 0)
            {
                var errorCode = Marshal.GetLastWin32Error();
                status = $"Error setting screen resolution: {errorCode}";
            }
            else
            {
                status = "Screen resolution set successfully.";
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error setting screen resolution: {ex.Message}");
        }
    }

    [DllImport("user32.dll")]
    private static extern int ChangeDisplaySettingsEx(string lpszDeviceName, ref Devmode lpDevMode, IntPtr hwnd, uint dwflags, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    private struct Devmode
    {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string dmDeviceName;

        public short dmSpecVersion;
        public short dmDriverVersion;
        public short dmSize;
        public short dmDriverExtra;
        public int dmFields;
        public short dmOrientation;
        public short dmPaperSize;
        public short dmPaperLength;
        public short dmPaperWidth;
        public short dmScale;
        public short dmCopies;
        public short dmDefaultSource;
        public short dmPrintQuality;
        public short dmColor;
        public short dmDuplex;
        public short dmYResolution;
        public short dmTTOption;
        public short dmCollate;

        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
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
