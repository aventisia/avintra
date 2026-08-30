using NodeLibrary.MouseAndKeyboardNodes.Helpers;
using System.Runtime.InteropServices;

namespace NodeLibrary.MouseAndKeyboardNodes;

[DisplayName("Set Key State"), Description("Sets the state (on or off) for the keys Caps Lock, Num Lock, or Scroll Lock.")]
[NodeMetadata(icon: "/assets/MouseAndKeyboard.svg")]
public class SetKeyStateNode : BaseNode
{
    [DisplayName("Key"), Description("The key to modify (e.g., 'CapsLock', 'NumLock', 'ScrollLock').")]
    public required InArgument<KeyEnum> Key { get; set; } = new InArgument<KeyEnum>(KeyEnum.CapsLock);
    [DisplayName("State"), Description("Whether to enable (On) or disable (Off) the key state.")]
    public required InArgument<StateEnum> State { get; set; } = new InArgument<StateEnum>(StateEnum.On);

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        try
        {
            var key = Key.Get(context);
            var state = State.Get(context);

            switch (key)
            {
                case KeyEnum.CapsLock:
                    ToggleCapsLock(state == StateEnum.On);
                    break;
                case KeyEnum.NumLock:
                    ToggleNumLock(state == StateEnum.On);
                    break;
                case KeyEnum.ScrollLock:
                    ToggleScrollLock(state == StateEnum.On);
                    break;
                default:
                    throw new ArgumentException(
                        $"Unsupported key: '{key}'. Supported keys are CapsLock, NumLock, ScrollLock.");
            }

            status = $"Successfully set {key.GetDisplayName()} to {(state == StateEnum.On ? "enabled" : "disabled")}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);

        }
        catch (Exception ex)
        {
            status = $"Error setting key state: {ex.Message}";
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, status);
        }
    }

    private static void ToggleCapsLock(bool enable)
    {
        SetToggleKeyState(0x14, enable);
    }

    private static void ToggleNumLock(bool enable)
    {
        SetToggleKeyState(0x90, enable);
    }

    private static void ToggleScrollLock(bool enable)
    {
        SetToggleKeyState(0x91, enable);
    }

    private static void SetToggleKeyState(int virtualKey, bool enable)
    {
        var isOn = (NativeMethods.GetKeyState(virtualKey) & 1) == 1;
        if (isOn != enable)
        {
            KeyboardHelper.KeyPress((ushort)virtualKey);
        }
    }

    private static class NativeMethods
    {
        [DllImport("user32.dll")]
        public static extern short GetKeyState(int nVirtKey);
    }
}

public static class EnumExtensions
{
    public static string GetDisplayName(this Enum value)
    {
        var field = value.GetType().GetField(value.ToString());
        var attribute = (DisplayAttribute)Attribute.GetCustomAttribute(
            field,
            typeof(DisplayAttribute));

        return attribute?.Name ?? value.ToString();
    }
}

public enum KeyEnum
{
    [Display(Name = "Caps Lock", Description = "Toggles the Caps Lock state.")]
    CapsLock,

    [Display(Name = "Num Lock", Description = "Toggles the Num Lock state.")]
    NumLock,

    [Display(Name = "Scroll Lock", Description = "Toggles the Scroll Lock state.")]
    ScrollLock
}

public enum StateEnum
{
    [Display(Name = "On", Description = "Enables the key state.")]
    On,

    [Display(Name = "Off", Description = "Disables the key state.")]
    Off
}



