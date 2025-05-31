namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    //[DisplayName("Show Desktop"), Description("Shows the desktop by minimizing all windows.")]
    //public class ShowDesktopActivity : CodeActivity
    //{
    //    [Category("Output"), Description("Returns the status message.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var status = "";

    //        try
    //        {
    //            NativeMethods.ShowDesktop();
    //            StatusMessage.Set(context, "Desktop shown successfully.");
    //        }
    //        catch (Exception ex)
    //        {
    //            status = $"Error showing desktop: {ex.Message}";
    //        }

    //        StatusMessage.Set(context, status);
    //    }

    //    private static class NativeMethods
    //    {
    //        [DllImport("user32.dll")]
    //        public static extern bool ShowDesktop(IntPtr hWnd);
    //    }
    //}
}