using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.MessageBoxActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MessageBoxActivities
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
            try
            {
                var title = context.GetValue(InputDialogTitle);
                var message = context.GetValue(InputDialogMessage);
                var defaultValue = context.GetValue(DefaultValue);
                var inputType = context.GetValue(InputType);
                var keepOnTop = context.GetValue(KeepOnTop);

                var resultEnum = DialogResultEnum.Cancel;
                var inputResult = string.Empty;

                // Create and configure form
                var form = new Form
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

                var label = new Label { Left = 10, Top = 20, Text = message ?? "Enter value:", Width = 360 };
                var textBox = new TextBox { Left = 10, Top = 45, Width = 360, Text = defaultValue ?? "" };

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

                var okButton = new Button { Text = "OK", Left = 210, Width = 75, Top = 80, DialogResult = DialogResult.OK };
                var cancelButton = new Button { Text = "Cancel", Left = 295, Width = 75, Top = 80, DialogResult = DialogResult.Cancel };

                form.Controls.Add(label);
                form.Controls.Add(textBox);
                form.Controls.Add(okButton);
                form.Controls.Add(cancelButton);

                form.AcceptButton = okButton;
                form.CancelButton = cancelButton;

                var dialogResult = form.ShowDialog();

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
                UserInput.Set(context, inputResult);
                ButtonPressed.Set(context, resultEnum);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Dialog closed with: {resultEnum}");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error displaying input dialog: {ex.Message}");
            }
        }

    }

    public enum InputTypeEnum
    {
        [Display(Name = "Text", Description = "Plain text input type.")]
        Text,

        [Display(Name = "Password", Description = "Password input type (masked input).")]
        Password
    }
}