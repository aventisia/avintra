using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text.RegularExpressions;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MessageBoxActivities
{
    [DisplayName("Display Message")]
    [Description("Displays a message box")]
    [ActivityMetaData(nodeImg: "/assets/MessageBox.svg")]
    public class DisplayMessageActivity : BaseCodeActivity
    {
        [DisplayName("Message Box Title")]
        [Description("The title text displayed at the top of the message box.")]
        public InArgument<string> Title { get; set; }


        [DisplayName("Message to Display")]
        [Description("The main content of the message box (supports string, DataTable, or any object).")]
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
        [RenderIfCondition(nameof(AutoClose), true)]
        public InArgument<int> Timeout { get; set; }


        [DisplayName("Button Pressed")]
        [Description("True if a button was pressed.")]
        public OutArgument<bool> ButtonPressed { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var title = context.GetValue(Title) ?? "Message";
                var messageText = context.GetValue(Message);
                var iconEnum = context.GetValue(Icon);
                var buttonEnum = context.GetValue(Buttons);
                var defaultEnum = context.GetValue(DefaultButton);
                var keepOnTop = context.GetValue(KeepOnTop);
                var autoClose = context.GetValue(AutoClose);
                var timeout = context.GetValue(Timeout);

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
                        form.Size = new Size(700, 250);

                        var label = new Label
                        {
                            Text = messageText,
                            Dock = DockStyle.Fill,
                            TextAlign = ContentAlignment.MiddleCenter,
                            Font = new Font("Segoe UI", 12),
                            Padding = new Padding(10),
                            AutoSize = false
                        };

                        var okButton = new Button
                        {
                            Text = "OK",
                            DialogResult = DialogResult.OK,
                            Dock = DockStyle.Bottom,
                            Height = 40
                        };

                        form.Controls.Add(label);
                        form.Controls.Add(okButton);
                        form.AcceptButton = okButton;

                        bool wasAutoClosed = false;

                        form.Shown += (sender, args) =>
                        {
                            var timer = new Timer { Interval = timeout * 1000 };
                            timer.Tick += (s, e) =>
                            {
                                timer.Stop();
                                wasAutoClosed = true;
                                form.DialogResult = DialogResult.OK;
                                form.Close();
                            };
                            timer.Start();
                        };

                        result = form.ShowDialog();

                        // Fallback: ensure result reflects auto-close
                        if (wasAutoClosed && result == DialogResult.None)
                        {
                            result = DialogResult.OK;
                        }
                    }
                }
                else
                {
                    var options = MessageBoxOptions.DefaultDesktopOnly;
                    if (keepOnTop)
                        options |= MessageBoxOptions.ServiceNotification;

                    result = MessageBox.Show(messageText, title, buttons, icon, defaultButton, options);
                }

                // Key Fix: consider auto-close as valid interaction
                bool buttonPressed = result != DialogResult.None || (autoClose && timeout > 0);
                context.SetValue(ButtonPressed, buttonPressed);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Message box closed with result: {result}");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error showing message box: {ex.Message}");
            }
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
        [Display(Name = "None", Description = "No icon is displayed.")]
        None,

        [Display(Name = "Information", Description = "An information icon (i).")]
        Information,

        [Display(Name = "Question", Description = "A question mark icon.")]
        Question,

        [Display(Name = "Warning", Description = "A warning icon (!).")]
        Warning,

        [Display(Name = "Error", Description = "An error icon (X).")]
        Error
    }

    public enum MessageBoxButtonsEnum
    {
        [Display(Name = "OK", Description = "Displays an OK button.")]
        OK,

        [Display(Name = "OK - Cancel", Description = "Displays OK and Cancel buttons.")]
        OKCancel,

        [Display(Name = "Yes - No", Description = "Displays Yes and No buttons.")]
        YesNo,

        [Display(Name = "Yes - No - Cancel", Description = "Displays Yes, No, and Cancel buttons.")]
        YesNoCancel,

        [Display(Name = "Abort - Retry - Ignore", Description = "Displays Abort, Retry, and Ignore buttons.")]
        AbortRetryIgnore,

        [Display(Name = "Retry - Cancel", Description = "Displays Retry and Cancel buttons.")]
        RetryCancel
    }

    public enum DefaultButtonEnum
    {
        [Display(Name = "First Button", Description = "The first button is the default.")]
        Button1 = 0,

        [Display(Name = "Second Button", Description = "The second button is the default.")]
        Button2 = 1,

        [Display(Name = "Third Button", Description = "The third button is the default.")]
        Button3 = 2
    }
}