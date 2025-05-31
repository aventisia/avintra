namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    //[DisplayName("Get Screen Resolution")]
    //[Description("Gets the width, height, bit count, and frequency of a selected monitor.")]
    //public class GetScreenResolutionActivity : CodeActivity
    //{
    //    [Category("Output")]
    //    [Description("Returns the screen resolution details.")]
    //    public OutArgument<ScreenResolution> ScreenDetails { get; set; }

    //    [Category("Output")]
    //    [Description("Returns the status message.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var screenDetails = new ScreenResolution();
    //        var status = "";

    //        try
    //        {
    //            foreach (var screen in Screen.AllScreens)
    //            {
    //                screenDetails.Width = screen.Bounds.Width;
    //                screenDetails.Height = screen.Bounds.Height;
    //                screenDetails.BitCount = screen.BitsPerPixel;
    //                screenDetails.Frequency = screen.RefreshRate;

    //                ScreenDetails.Set(context, screenDetails);
    //                StatusMessage.Set(context, "Screen resolution retrieved successfully.");
    //                return;
    //            }

    //            status = "No screens found.";
    //        }
    //        catch (Exception ex)
    //        {
    //            status = $"Error getting screen resolution: {ex.Message}";
    //        }

    //        StatusMessage.Set(context, status);
    //    }

    //    public class ScreenResolution
    //    {
    //        public int Width { get; set; }
    //        public int Height { get; set; }
    //        public int BitCount { get; set; }
    //        public int Frequency { get; set; }
    //    }
    //}
}