using System.Activities;
using System.ComponentModel;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MessageBoxActivities
{
    [DisplayName("Display Message")]
    [Description("Displays a message box.")]
    public class DisplayMessageActivity : Extensions.BaseCodeActivity
    {

        [DisplayName("Message Box Title")]
        [Description("The title text displayed at the top of the message box.")]
        public InArgument<string> Title { get; set; }


        [DisplayName("Message to Display")]
        [Description("The main text content of the message box.")]
        public InArgument<string> Message { get; set; }


        [DisplayName("Message Box Icon")]
        [Description("The icon to be displayed in the message box.")]
        public InArgument<MessageBoxIconEnum> Icon { get; set; }


        [DisplayName("Message Box Buttons")]
        [Description("The buttons to display in the message box.")]
        public InArgument<MessageBoxButtonsEnum> Buttons { get; set; }


        [DisplayName("Default Button")]
        [Description("The button that is highlighted by default.")]
        public InArgument<DefaultButtonEnum> DefaultButton { get; set; }


        [DisplayName("Keep Message Box Always on Top")]
        [Description("If true, the message box will stay on top of other windows.")]
        public InArgument<bool> KeepOnTop { get; set; }


        [DisplayName("Close Message Box Automatically")]
        [Description("If true, the message box will close automatically after the specified timeout.")]
        public InArgument<bool> AutoClose { get; set; }


        [DisplayName("Timeout (Seconds)")]
        [Description("The number of seconds after which the message box closes automatically if 'Close Message Box Automatically' is enabled.")]
        public InArgument<int> Timeout { get; set; }


        [DisplayName("Button Pressed")]
        [Description("True if a button was pressed.")]
        public OutArgument<bool> ButtonPressed { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string title = context.GetValue(Title) ?? "Message";
            string message = context.GetValue(Message);
            var iconEnum = context.GetValue(Icon);
            var buttonEnum = context.GetValue(Buttons);
            var defaultEnum = context.GetValue(DefaultButton);
            bool keepOnTop = context.GetValue(KeepOnTop);
            bool autoClose = context.GetValue(AutoClose);
            int timeout = context.GetValue(Timeout);

            var icon = GetMessageBoxIcon(iconEnum);
            var buttons = GetMessageBoxButtons(buttonEnum);
            var defaultButton = GetDefaultButton(defaultEnum);

            DialogResult result;

            if (autoClose && timeout > 0)
            {
                using (var form = new Form())
                {
                    form.Text = title;
                    form.StartPosition = FormStartPosition.CenterScreen;
                    form.FormBorderStyle = FormBorderStyle.FixedDialog;
                    form.MaximizeBox = false;
                    form.MinimizeBox = false;
                    form.ControlBox = false;
                    form.TopMost = keepOnTop;

                    var label = new Label
                    {
                        Text = message,
                        Dock = DockStyle.Fill,
                        TextAlign = System.Drawing.ContentAlignment.MiddleCenter
                    };
                    form.Controls.Add(label);

                    form.Show();
                    System.Threading.Thread.Sleep(timeout * 1000);
                    form.Close();

                    result = DialogResult.None;
                }
            }
            else
            {
                var options = MessageBoxOptions.DefaultDesktopOnly;
                if (keepOnTop)
                {
                    options |= MessageBoxOptions.ServiceNotification;
                }

                result = MessageBox.Show(
                    message,
                    title,
                    buttons,
                    icon,
                    defaultButton,
                    options
                );
            }

            context.SetValue(ButtonPressed, result != DialogResult.None);
        }

        private MessageBoxIcon GetMessageBoxIcon(MessageBoxIconEnum iconEnum)
        {
            switch (iconEnum)
            {
                case MessageBoxIconEnum.Information:
                    return MessageBoxIcon.Information;
                case MessageBoxIconEnum.Question:
                    return MessageBoxIcon.Question;
                case MessageBoxIconEnum.Warning:
                    return MessageBoxIcon.Warning;
                case MessageBoxIconEnum.Error:
                    return MessageBoxIcon.Error;
                default:
                    return MessageBoxIcon.None;
            }
        }

        private MessageBoxButtons GetMessageBoxButtons(MessageBoxButtonsEnum buttonEnum)
        {
            switch (buttonEnum)
            {
                case MessageBoxButtonsEnum.OKCancel:
                    return MessageBoxButtons.OKCancel;
                case MessageBoxButtonsEnum.YesNo:
                    return MessageBoxButtons.YesNo;
                case MessageBoxButtonsEnum.YesNoCancel:
                    return MessageBoxButtons.YesNoCancel;
                case MessageBoxButtonsEnum.AbortRetryIgnore:
                    return MessageBoxButtons.AbortRetryIgnore;
                case MessageBoxButtonsEnum.RetryCancel:
                    return MessageBoxButtons.RetryCancel;
                default:
                    return MessageBoxButtons.OK;
            }
        }

        private MessageBoxDefaultButton GetDefaultButton(DefaultButtonEnum defaultEnum)
        {
            switch (defaultEnum)
            {
                case DefaultButtonEnum.Button2:
                    return MessageBoxDefaultButton.Button2;
                case DefaultButtonEnum.Button3:
                    return MessageBoxDefaultButton.Button3;
                default:
                    return MessageBoxDefaultButton.Button1;
            }
        }
    }

    public enum MessageBoxIconEnum
    {
        [Description("None")] None,
        [Description("Information")] Information,
        [Description("Question")] Question,
        [Description("Warning")] Warning,
        [Description("Error")] Error,
    }

    public enum MessageBoxButtonsEnum
    {
        [Description("OK")] OK,
        [Description("OK - Cancel")] OKCancel,
        [Description("Yes - No")] YesNo,
        [Description("Yes - No - Cancel")] YesNoCancel,
        [Description("Abort - Retry - Ignore")] AbortRetryIgnore,
        [Description("Retry - Cancel")] RetryCancel,
    }

    public enum DefaultButtonEnum
    {
        [Description("First Button")] Button1 = 0,
        [Description("Second Button")] Button2 = 1,
        [Description("Third Button")] Button3 = 2
    }
}
