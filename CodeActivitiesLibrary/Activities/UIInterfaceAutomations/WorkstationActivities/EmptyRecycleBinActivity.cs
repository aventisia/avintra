namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    //[DisplayName("Empty Recycle Bin")]
    //[Description("Deletes all files from the Windows recycle bin.")]
    //public class EmptyRecycleBinActivity : CodeActivity
    //{
    //    private const uint FoDelete = 0x3;
    //    private const uint FofSilent = 0x4000;
    //    private const uint FofNoconfirmation = 0x10;

    //    [Category("Output")]
    //    [Description("Returns the status message.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var status = "";

    //        try
    //        {
    //            SHFileOperationFlags flags = SHFileOperationFlags.FOF_SILENT | SHFileOperationFlags.FOF_NOCONFIRMATION;
    //            var zero = IntPtr.Zero;

    //            var fileOp = new Shfileopstruct
    //            {
    //                hwnd = zero,
    //                wFunc = FoDelete,
    //                pFrom = @"C:\$Recycle.Bin" + "\0\0",
    //                fFlags = flags
    //            };

    //            var result = SHFileOperation(ref fileOp);

    //            if (result == 0)
    //                StatusMessage.Set(context, "Recycle bin emptied successfully.");
    //            else
    //                status = $"Error emptying recycle bin: {result}";
    //        }
    //        catch (Exception ex)
    //        {
    //            status = $"Error emptying recycle bin: {ex.Message}";
    //        }

    //        StatusMessage.Set(context, status);
    //    }

    //    [DllImport("shell32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    //    private static extern int SHFileOperation(ref Shfileopstruct psf);

    //    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    //    private struct Shfileopstruct
    //    {
    //        public IntPtr hwnd;
    //        public uint wFunc;
    //        [MarshalAs(UnmanagedType.LPWStr)] public string pFrom;

    //        [MarshalAs(UnmanagedType.LPWStr)] public string pTo;

    //        public ushort fFlags;
    //        [MarshalAs(UnmanagedType.Bool)] public bool fAnyOperationsAborted;

    //        public IntPtr hNameMappings;

    //        [MarshalAs(UnmanagedType.LPWStr)] public string lpszProgressTitle;
    //    }
    //}
}