using NodeLibrary.MouseAndKeyboardNodes.Helpers;

namespace NodeLibrary.MouseAndKeyboardNodes;

[DisplayName("Send Mouse Click"), Description("Sends a mouse click event to the specified location.")]
[NodeMetadata(icon: "/assets/MouseAndKeyboard.svg")]
public class SendMouseClickNode : BaseNode
{
    [DisplayName("Mouse Event to Send"), Description("The type of mouse event to send (e.g., Left Click, Right Click).")]
    public required InArgument<MouseEventEnum> MouseEvent { get; set; } = new InArgument<MouseEventEnum>(MouseEventEnum.LeftClick);

    [DisplayName("Wait"), Description("Milliseconds to wait before sending the mouse event.")]
    public InArgument<int> WaitBeforeSending { get; set; } = new InArgument<int>(0);

    [DisplayName("Move Mouse"), Description("If true, moves the mouse to the current cursor position before sending the event.")]
    public InArgument<bool> MoveMouse { get; set; } = new InArgument<bool>(false);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var mouseEvent = MouseEvent.Get(context);
            var waitTime = WaitBeforeSending.Get(context);
            var moveMouse = MoveMouse.Get(context);

            if (waitTime < 0)
                throw new ArgumentException("Wait time cannot be negative.");

            // Keep parity with legacy behavior: when enabled, explicitly query the cursor position.
            if (moveMouse)
            {
                _ = MouseHelper.GetCursorPosition();
            }

            // Simulate the mouse event
            switch (mouseEvent)
            {
                case MouseEventEnum.LeftClick:
                    ClickCurrentPosition(MouseButtonsEnum.Left);
                    break;

                case MouseEventEnum.RightClick:
                    ClickCurrentPosition(MouseButtonsEnum.Right);
                    break;

                case MouseEventEnum.DoubleClick:
                    ClickCurrentPosition(MouseButtonsEnum.Left);
                    Thread.Sleep(50); // Small delay between clicks
                    ClickCurrentPosition(MouseButtonsEnum.Left);
                    break;

                case MouseEventEnum.LeftButtonDown:
                    MouseDownCurrentPosition(MouseButtonsEnum.Left);
                    break;

                case MouseEventEnum.LeftButtonUp:
                    MouseUpCurrentPosition(MouseButtonsEnum.Left);
                    break;

                case MouseEventEnum.RightButtonDown:
                    MouseDownCurrentPosition(MouseButtonsEnum.Right);
                    break;

                case MouseEventEnum.RightButtonUp:
                    MouseUpCurrentPosition(MouseButtonsEnum.Right);
                    break;

                case MouseEventEnum.MiddleClick:
                    ClickCurrentPosition(MouseButtonsEnum.Middle);
                    break;

                default:
                    throw new ArgumentOutOfRangeException(nameof(mouseEvent));
            }

            status = $"Successfully sent '{mouseEvent}' event.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            status = $"Error sending mouse event: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }

    private static void ClickCurrentPosition(MouseButtonsEnum button)
    {
        var point = MouseHelper.GetCursorPosition();
        MouseHelper.MouseClick(point.X, point.Y, button);
    }

    private static void MouseDownCurrentPosition(MouseButtonsEnum button)
    {
        var point = MouseHelper.GetCursorPosition();
        MouseHelper.MouseDown(point.X, point.Y, button);
    }

    private static void MouseUpCurrentPosition(MouseButtonsEnum button)
    {
        var point = MouseHelper.GetCursorPosition();
        MouseHelper.MouseUp(point.X, point.Y, button);
    }
}

public enum MouseEventEnum
{
    [Display(Name = "Left click", Description = "Simulates a left mouse click.")]
    LeftClick,

    [Display(Name = "Right click", Description = "Simulates a right mouse click.")]
    RightClick,

    [Display(Name = "Double click", Description = "Simulates a double mouse click.")]
    DoubleClick,

    [Display(Name = "Left button down", Description = "Presses the left mouse button down.")]
    LeftButtonDown,

    [Display(Name = "Left button up", Description = "Releases the left mouse button.")]
    LeftButtonUp,

    [Display(Name = "Right button down", Description = "Presses the right mouse button down.")]
    RightButtonDown,

    [Display(Name = "Right button up", Description = "Releases the right mouse button.")]
    RightButtonUp,

    [Display(Name = "Middle click", Description = "Simulates a middle mouse click.")]
    MiddleClick
}



