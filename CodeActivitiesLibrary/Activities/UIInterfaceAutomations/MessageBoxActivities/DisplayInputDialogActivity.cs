namespace CodeActivitiesLibrary.UIInterfaceAutomations.MessageBoxActivities
{
    // Activity to display an input dialog
    //[DisplayName("Display Input Dialog"), Description("Displays a dialog box that prompts the user to enter text.")]
    //public class DisplayInputDialogActivity : CodeActivity
    //{
    //    [RequiredArgument, Category("Input"), Description("The prompt message to display.")]
    //    public InArgument<string> Prompt { get; set; }

    //    [Category("Output"), Description("Returns the text entered by the user.")]
    //    public OutArgument<string> Result { get; set; }

    //    [Category("Output"), Description("Returns the status message of the operation.")]
    //    public OutArgument<string> StatusMessage { get; set; }

    //    protected override void Execute(CodeActivityContext context)
    //    {
    //        var prompt = Prompt.Get(context);
    //        var result = "";
    //        var status = "";

    //        try
    //        {
    //            result = Microsoft.VisualBasic.Interaction.InputBox(prompt);
    //            if (!string.IsNullOrEmpty(result))
    //            {
    //                status = "Input dialog completed successfully.";
    //            }
    //            else
    //            {
    //                status = "User canceled the input dialog.";
    //            }
    //        }
    //        catch (Exception ex)
    //        {
    //            result = "";
    //            status = $"Error displaying input dialog: {ex.Message}";
    //        }

    //        Result.Set(context, result);
    //        StatusMessage.Set(context, status);
    //    }
    //}
}