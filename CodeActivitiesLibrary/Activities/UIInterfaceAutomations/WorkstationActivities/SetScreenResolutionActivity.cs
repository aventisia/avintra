using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Set Screen Resolution")]
    [Description("Sets the width, height, bit count, and frequency of a selected monitor.")]
    public class SetScreenResolutionActivity : CodeActivity
    {
        private const int CdsUpdateregistry = 0x01;

        [RequiredArgument]
        [Category("Input")]
        [Description("The width of the screen.")]
        public InArgument<int> Width { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The height of the screen.")]
        public InArgument<int> Height { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The bit count of the screen.")]
        public InArgument<int> BitCount { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The frequency (refresh rate) of the screen.")]
        public InArgument<int> Frequency { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var width = Width.Get(context);
            var height = Height.Get(context);
            var bitCount = BitCount.Get(context);
            var frequency = Frequency.Get(context);
            var status = "";

            try
            {
                var devMode = new Devmode
                {
                    dmSize = (short)Marshal.SizeOf(typeof(Devmode)),
                    dmPelsWidth = width,
                    dmPelsHeight = height,
                    dmBitsPerPel = bitCount,
                    dmDisplayFrequency = frequency
                };

                // C# 7.3: ChangeDisplaySettingsEx returns int, not bool
                int result = ChangeDisplaySettingsEx(null, ref devMode, IntPtr.Zero, CdsUpdateregistry, IntPtr.Zero);
                if (result != 0) // DISP_CHANGE_SUCCESSFUL == 0
                {
                    var errorCode = Marshal.GetLastWin32Error();
                    status = $"Error setting screen resolution: {errorCode}";
                }
                else
                {
                    StatusMessage.Set(context, "Screen resolution set successfully.");
                }
            }
            catch (Exception ex)
            {
                status = $"Error setting screen resolution: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }

        [DllImport("user32.dll")]
        private static extern int ChangeDisplaySettingsEx(string lpszDeviceName, ref Devmode lpDevMode, IntPtr hwnd,
            uint dwflags, IntPtr lParam);

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
}