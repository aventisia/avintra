using CodeActivitiesLibrary.Extensions;
using System.Activities;
using System.ComponentModel;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MessageBoxActivities
{
    [DisplayName("Display Input Dialog")]
    [Description("Displays a dialog box that prompts the user to enter text.")]
    public class DisplayInputDialogActivity : BaseCodeActivity
    {

        [DisplayName("Input Dialog Title")]
        [Description("The title text displayed at the top of the input dialog.")]
        public InArgument<string> InputDialogTitle { get; set; }


        [DisplayName("Input Dialog Message")]
        [Description("The main text content of the input dialog.")]
        public InArgument<string> InputDialogMessage { get; set; }


        [DisplayName("Default Value")]
        [Description("The default text pre-filled in the input field.")]
        public InArgument<string> DefaultValue { get; set; }


        [DisplayName("Input Type")]
        [Description("The type of input field (Text or Password).")]
        public InArgument<InputTypeEnum> InputType { get; set; }


        [DisplayName("Keep Input Dialog Always on Top")]
        [Description("If true, the input dialog will stay on top of other windows.")]
        public InArgument<bool> KeepOnTop { get; set; }


        [DisplayName("User Input")]
        [Description("The text entered by the user.")]
        public OutArgument<string> UserInput { get; set; }


        [DisplayName("Button Pressed")]
        [Description("The result indicating which button was pressed by the user.")]
        public OutArgument<DialogResultEnum> ButtonPressed { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            string title = context.GetValue(InputDialogTitle);
            string message = context.GetValue(InputDialogMessage);
            string defaultValue = context.GetValue(DefaultValue);
            InputTypeEnum inputType = context.GetValue(InputType);
            bool keepOnTop = context.GetValue(KeepOnTop);

            DialogResultEnum resultEnum = DialogResultEnum.Cancel;
            string inputResult = string.Empty;

            // Create and configure form
            Form form = new Form
            {
                Width = 400,
                Height = 160,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                Text = title ?? "Input Dialog",
                StartPosition = FormStartPosition.CenterScreen,
                TopMost = keepOnTop,
                MinimizeBox = false,
                MaximizeBox = false
            };

            Label label = new Label() { Left = 10, Top = 20, Text = message ?? "Enter value:", Width = 360 };
            TextBox textBox = new TextBox() { Left = 10, Top = 45, Width = 360, Text = defaultValue ?? "" };

            switch (inputType)
            {
                case InputTypeEnum.Password:
                    textBox.UseSystemPasswordChar = true;
                    break;
                case InputTypeEnum.Text:
                default:
                    textBox.UseSystemPasswordChar = false;
                    break;
            }

            Button okButton = new Button() { Text = "OK", Left = 210, Width = 75, Top = 80, DialogResult = DialogResult.OK };
            Button cancelButton = new Button() { Text = "Cancel", Left = 295, Width = 75, Top = 80, DialogResult = DialogResult.Cancel };

            form.Controls.Add(label);
            form.Controls.Add(textBox);
            form.Controls.Add(okButton);
            form.Controls.Add(cancelButton);

            form.AcceptButton = okButton;
            form.CancelButton = cancelButton;

            DialogResult dialogResult = form.ShowDialog();

            if (dialogResult == DialogResult.OK)
            {
                inputResult = textBox.Text;
                resultEnum = DialogResultEnum.OK;
            }
            else
            {
                resultEnum = DialogResultEnum.Cancel;
            }

            // Set output arguments
            context.SetValue(UserInput, inputResult);
            context.SetValue(ButtonPressed, resultEnum);
            context.SetValue(StatusMessage, $"Dialog closed with: {resultEnum}");
        }
    }

    public enum InputTypeEnum
    {
        [Description("Text")]
        Text,

        [Description("Password")]
        Password
    }
}