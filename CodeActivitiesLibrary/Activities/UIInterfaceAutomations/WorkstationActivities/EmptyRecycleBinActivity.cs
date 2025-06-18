using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Empty Recycle Bin")]
    [Description("Deletes all files from the Windows recycle bin for all users or current user.")]
    public class EmptyRecycleBinActivity : BaseCodeActivity
    {
        [DisplayName("Scope")]
        [Description(
            "Specifies whether to empty the recycle bin for all users (requires admin privileges) or just the current user.")]
        [DefaultValue(RecycleBinScope.CurrentUser)]
        public InArgument<RecycleBinScope> Scope { get; set; }

        [DisplayName("Show Confirmation")]
        [Description("Show confirmation dialog (false by default).")]
        [DefaultValue(false)]
        public InArgument<bool> ShowConfirmation { get; set; }

        [DisplayName("Show progress")]
        [Description("Show progress dialog (false by default).")]
        [DefaultValue(false)]
        public InArgument<bool> ShowProgress { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var scope = Scope.Get(context);
            var showConfirmation = ShowConfirmation.Get(context);
            var showProgress = ShowProgress.Get(context);
            var status = string.Empty;

            try
            {
                bool success;
                if (scope == RecycleBinScope.AllUsers)
                {
                    success = EmptyAllRecycleBins(showConfirmation, showProgress);
                }
                else
                {
                    success = SHEmptyRecycleBin(IntPtr.Zero, null,
                        (showConfirmation ? 0 : RecycleBinFlags.SHERB_NOCONFIRMATION) |
                        (showProgress ? 0 : RecycleBinFlags.SHERB_NOPROGRESSUI) |
                        RecycleBinFlags.SHERB_NOSOUND);
                }

                if (success)
                {
                    status = scope == RecycleBinScope.AllUsers
                        ? "All users' recycle bins emptied successfully."
                        : "Current user's recycle bin emptied successfully.";
                }
                else
                {
                    status = scope == RecycleBinScope.AllUsers
                        ? "Failed to empty all users' recycle bins (admin rights required?)."
                        : "Failed to empty current user's recycle bin.";
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                status = $"Error emptying recycle bin: {ex.Message}";
                StatusMessage.Set(context, status);
            }
        }

        private bool EmptyAllRecycleBins(bool showConfirmation, bool showProgress)
        {
            // For all users, we need to empty each $Recycle.Bin folder
            var drives = Environment.GetLogicalDrives();
            var overallSuccess = true;

            foreach (var drive in drives)
            {
                try
                {
                    var recyclePath = System.IO.Path.Combine(drive, "$Recycle.Bin");
                    if (System.IO.Directory.Exists(recyclePath))
                    {
                        var flags = SHFileOperationFlags.FOF_SILENT |
                                    SHFileOperationFlags.FOF_NOCONFIRMATION |
                                    SHFileOperationFlags.FOF_NOERRORUI;

                        if (showConfirmation)
                            flags &= ~SHFileOperationFlags.FOF_NOCONFIRMATION;
                        if (showProgress)
                            flags &= ~SHFileOperationFlags.FOF_SILENT;

                        var fileOp = new SHFILEOPSTRUCT
                        {
                            wFunc = FileOperationType.FO_DELETE,
                            pFrom = recyclePath + "\0\0",
                            fFlags = flags,
                            hwnd = IntPtr.Zero
                        };

                        var result = SHFileOperation(ref fileOp);
                        if (result != 0)
                        {
                            overallSuccess = false;
                        }
                    }
                }
                catch
                {
                    overallSuccess = false;
                }
            }

            return overallSuccess;
        }

        #region Windows API

        [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
        private static extern bool SHEmptyRecycleBin(IntPtr hwnd, string pszRootPath, RecycleBinFlags dwFlags);

        [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
        private static extern int SHFileOperation(ref SHFILEOPSTRUCT lpFileOp);

        [Flags]
        private enum RecycleBinFlags : uint
        {
            SHERB_NOCONFIRMATION = 0x00000001,
            SHERB_NOPROGRESSUI = 0x00000002,
            SHERB_NOSOUND = 0x00000004
        }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        private struct SHFILEOPSTRUCT
        {
            public IntPtr hwnd;
            public FileOperationType wFunc;
            [MarshalAs(UnmanagedType.LPWStr)] public string pFrom;
            [MarshalAs(UnmanagedType.LPWStr)] public string pTo;
            public SHFileOperationFlags fFlags;
            [MarshalAs(UnmanagedType.Bool)] public bool fAnyOperationsAborted;
            public IntPtr hNameMappings;
            [MarshalAs(UnmanagedType.LPWStr)] public string lpszProgressTitle;
        }

        private enum FileOperationType : uint
        {
            FO_MOVE = 0x0001,
            FO_COPY = 0x0002,
            FO_DELETE = 0x0003,
            FO_RENAME = 0x0004
        }

        [Flags]
        private enum SHFileOperationFlags : ushort
        {
            FOF_MULTIDESTFILES = 0x0001,
            FOF_CONFIRMMOUSE = 0x0002,
            FOF_SILENT = 0x0004,
            FOF_RENAMEONCOLLISION = 0x0008,
            FOF_NOCONFIRMATION = 0x0010,
            FOF_WANTMAPPINGHANDLE = 0x0020,
            FOF_ALLOWUNDO = 0x0040,
            FOF_FILESONLY = 0x0080,
            FOF_SIMPLEPROGRESS = 0x0100,
            FOF_NOCONFIRMMKDIR = 0x0200,
            FOF_NOERRORUI = 0x0400,
            FOF_NOCOPYSECURITYATTRIBS = 0x0800,
            FOF_NORECURSION = 0x1000,
            FOF_NO_CONNECTED_ELEMENTS = 0x2000,
            FOF_WANTNUKEWARNING = 0x4000,
            FOF_NORECURSEREPARSE = 0x8000
        }

        #endregion
    }

    public enum RecycleBinScope
    {
        [Display(Name = "Current User", Description = "Empty only the current user's recycle bin.")]
        CurrentUser,

        [Display(Name = "All Users", Description = "Empty recycle bins for all users (requires admin privileges).")]
        AllUsers
    }
}