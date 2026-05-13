using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.MouseAndKeyboardActivities.Enums
{
    public enum VirtualKeyEnum
    {
        [Display(Name = "None", Description = "No key pressed")]
        None = 0,

        [Display(Name = "Backspace", Description = "The BACKSPACE key")]
        Backspace = 8,

        [Display(Name = "Tab", Description = "The TAB key")]
        Tab = 9,

        [Display(Name = "Clear", Description = "The CLEAR key")]
        Clear = 0xC,

        [Display(Name = "Enter", Description = "The ENTER key")]
        Enter = 0xD,

        [Display(Name = "Shift", Description = "The SHIFT key")]
        Shift = 0x10,

        [Display(Name = "Ctrl", Description = "The CTRL key")]
        Ctrl = 0x11,

        [Display(Name = "Alt", Description = "The ALT key")]
        Alt = 0x12,

        [Display(Name = "Pause", Description = "The PAUSE key")]
        Pause = 0x13,

        [Display(Name = "Caps Lock", Description = "The CAPS LOCK key")]
        CapsLock = 0x14,

        [Display(Name = "Escape", Description = "The ESC key")]
        Escape = 0x1B,

        [Display(Name = "Space", Description = "The SPACEBAR key")]
        Space = 0x20,

        [Display(Name = "Page Up", Description = "The PAGE UP key")]
        PageUp = 0x21,

        [Display(Name = "Page Down", Description = "The PAGE DOWN key")]
        PageDown = 0x22,

        [Display(Name = "End", Description = "The END key")]
        End = 0x23,

        [Display(Name = "Home", Description = "The HOME key")]
        Home = 0x24,

        [Display(Name = "Left Arrow", Description = "The LEFT ARROW key")]
        LeftArrow = 0x25,

        [Display(Name = "Up Arrow", Description = "The UP ARROW key")]
        UpArrow = 0x26,

        [Display(Name = "Right Arrow", Description = "The RIGHT ARROW key")]
        RightArrow = 0x27,

        [Display(Name = "Down Arrow", Description = "The DOWN ARROW key")]
        DownArrow = 0x28,

        [Display(Name = "Select", Description = "The SELECT key")]
        Select = 0x29,

        [Display(Name = "Print", Description = "The PRINT key")]
        Print = 0x2A,

        [Display(Name = "Print Screen", Description = "The PRINT SCREEN key")]
        PrintScreen = 0x2C,

        [Display(Name = "Insert", Description = "The INS key")]
        Insert = 0x2D,

        [Display(Name = "Delete", Description = "The DEL key")]
        Delete = 0x2E,

        [Display(Name = "Help", Description = "The HELP key")]
        Help = 0x2F,

        [Display(Name = "Top Row 0", Description = "The 0 key on the top row")]
        TopRow0 = 0x30,

        [Display(Name = "Top Row 1", Description = "The 1 key on the top row")]
        TopRow1 = 0x31,

        [Display(Name = "Top Row 2", Description = "The 2 key on the top row")]
        TopRow2 = 0x32,

        [Display(Name = "Top Row 3", Description = "The 3 key on the top row")]
        TopRow3 = 0x33,

        [Display(Name = "Top Row 4", Description = "The 4 key on the top row")]
        TopRow4 = 0x34,

        [Display(Name = "Top Row 5", Description = "The 5 key on the top row")]
        TopRow5 = 0x35,

        [Display(Name = "Top Row 6", Description = "The 6 key on the top row")]
        TopRow6 = 0x36,

        [Display(Name = "Top Row 7", Description = "The 7 key on the top row")]
        TopRow7 = 0x37,

        [Display(Name = "Top Row 8", Description = "The 8 key on the top row")]
        TopRow8 = 0x38,

        [Display(Name = "Top Row 9", Description = "The 9 key on the top row")]
        TopRow9 = 0x39,

        [Display(Name = "A", Description = "The A key")]
        A = 0x41,

        [Display(Name = "B", Description = "The B key")]
        B = 0x42,

        [Display(Name = "C", Description = "The C key")]
        C = 0x43,

        [Display(Name = "D", Description = "The D key")]
        D = 0x44,

        [Display(Name = "E", Description = "The E key")]
        E = 0x45,

        [Display(Name = "F", Description = "The F key")]
        F = 0x46,

        [Display(Name = "G", Description = "The G key")]
        G = 0x47,

        [Display(Name = "H", Description = "The H key")]
        H = 0x48,

        [Display(Name = "I", Description = "The I key")]
        I = 0x49,

        [Display(Name = "J", Description = "The J key")]
        J = 0x4A,

        [Display(Name = "K", Description = "The K key")]
        K = 0x4B,

        [Display(Name = "L", Description = "The L key")]
        L = 0x4C,

        [Display(Name = "M", Description = "The M key")]
        M = 0x4D,

        [Display(Name = "N", Description = "The N key")]
        N = 0x4E,

        [Display(Name = "O", Description = "The O key")]
        O = 0x4F,

        [Display(Name = "P", Description = "The P key")]
        P = 0x50,

        [Display(Name = "Q", Description = "The Q key")]
        Q = 0x51,

        [Display(Name = "R", Description = "The R key")]
        R = 0x52,

        [Display(Name = "S", Description = "The S key")]
        S = 0x53,

        [Display(Name = "T", Description = "The T key")]
        T = 0x54,

        [Display(Name = "U", Description = "The U key")]
        U = 0x55,

        [Display(Name = "V", Description = "The V key")]
        V = 0x56,

        [Display(Name = "W", Description = "The W key")]
        W = 0x57,

        [Display(Name = "X", Description = "The X key")]
        X = 0x58,

        [Display(Name = "Y", Description = "The Y key")]
        Y = 0x59,

        [Display(Name = "Z", Description = "The Z key")]
        Z = 0x5A,

        [Display(Name = "Left Windows Key", Description = "The left Windows logo key")]
        LeftWindowsKey = 0x5B,

        [Display(Name = "Right Windows Key", Description = "The right Windows logo key")]
        RightWindowsKey = 0x5C,

        [Display(Name = "Apps / Menu Key", Description = "The application context menu key")]
        Apps = 0x5D,

        [Display(Name = "Sleep", Description = "The computer sleep key")]
        Sleep = 0x5F,

        [Display(Name = "Numpad 0", Description = "The 0 key on the numeric keypad")]
        NumPad0 = 0x60,

        [Display(Name = "Numpad 1", Description = "The 1 key on the numeric keypad")]
        NumPad1 = 0x61,

        [Display(Name = "Numpad 2", Description = "The 2 key on the numeric keypad")]
        NumPad2 = 0x62,

        [Display(Name = "Numpad 3", Description = "The 3 key on the numeric keypad")]
        NumPad3 = 0x63,

        [Display(Name = "Numpad 4", Description = "The 4 key on the numeric keypad")]
        NumPad4 = 0x64,

        [Display(Name = "Numpad 5", Description = "The 5 key on the numeric keypad")]
        NumPad5 = 0x65,

        [Display(Name = "Numpad 6", Description = "The 6 key on the numeric keypad")]
        NumPad6 = 0x66,

        [Display(Name = "Numpad 7", Description = "The 7 key on the numeric keypad")]
        NumPad7 = 0x67,

        [Display(Name = "Numpad 8", Description = "The 8 key on the numeric keypad")]
        NumPad8 = 0x68,

        [Display(Name = "Numpad 9", Description = "The 9 key on the numeric keypad")]
        NumPad9 = 0x69,

        [Display(Name = "Numpad *", Description = "The multiply key on the numeric keypad")]
        NumPadMultiply = 0x6A,

        [Display(Name = "Numpad +", Description = "The add key on the numeric keypad")]
        NumPadAdd = 0x6B,

        [Display(Name = "Numpad Separator", Description = "The separator key on the numeric keypad")]
        NumPadSeparator = 0x6C,

        [Display(Name = "Numpad -", Description = "The subtract key on the numeric keypad")]
        NumPadSubtract = 0x6D,

        [Display(Name = "Numpad .", Description = "The decimal key on the numeric keypad")]
        NumPadDecimal = 0x6E,

        [Display(Name = "Numpad /", Description = "The divide key on the numeric keypad")]
        NumPadDivide = 0x6F,

        [Display(Name = "F1", Description = "The F1 key")]
        F1 = 0x70,

        [Display(Name = "F2", Description = "The F2 key")]
        F2 = 0x71,

        [Display(Name = "F3", Description = "The F3 key")]
        F3 = 0x72,

        [Display(Name = "F4", Description = "The F4 key")]
        F4 = 0x73,

        [Display(Name = "F5", Description = "The F5 key")]
        F5 = 0x74,

        [Display(Name = "F6", Description = "The F6 key")]
        F6 = 0x75,

        [Display(Name = "F7", Description = "The F7 key")]
        F7 = 0x76,

        [Display(Name = "F8", Description = "The F8 key")]
        F8 = 0x77,

        [Display(Name = "F9", Description = "The F9 key")]
        F9 = 0x78,

        [Display(Name = "F10", Description = "The F10 key")]
        F10 = 0x79,

        [Display(Name = "F11", Description = "The F11 key")]
        F11 = 0x7A,

        [Display(Name = "F12", Description = "The F12 key")]
        F12 = 0x7B,

        [Display(Name = "Num Lock", Description = "The NUM LOCK key")]
        NumLock = 0x90,

        [Display(Name = "Scroll Lock", Description = "The SCROLL LOCK key")]
        ScrollLock = 0x91,

        [Display(Name = "Left Shift", Description = "The left SHIFT key")]
        LeftShift = 0xA0,

        [Display(Name = "Right Shift", Description = "The right SHIFT key")]
        RightShift = 0xA1,

        [Display(Name = "Left Ctrl", Description = "The left CTRL key")]
        LeftCtrl = 0xA2,

        [Display(Name = "Right Ctrl", Description = "The right CTRL key")]
        RightCtrl = 0xA3,

        [Display(Name = "Left Alt", Description = "The left ALT key")]
        LeftAlt = 0xA4,

        [Display(Name = "Right Alt", Description = "The right ALT key")]
        RightAlt = 0xA5,

        [Display(Name = "BrowserBack", Description = "The browser back key (Windows 2000 or later)")]
        BrowserBack = 0xA6,

        [Display(Name = "BrowserForward", Description = "The browser forward key (Windows 2000 or later)")]
        BrowserForward = 0xA7,

        [Display(Name = "BrowserRefresh", Description = "The browser refresh key (Windows 2000 or later)")]
        BrowserRefresh = 0xA8,

        [Display(Name = "BrowserStop", Description = "The browser stop key (Windows 2000 or later)")]
        BrowserStop = 0xA9,

        [Display(Name = "BrowserSearch", Description = "The browser search key (Windows 2000 or later)")]
        BrowserSearch = 0xAA,

        [Display(Name = "BrowserFavorites", Description = "The browser favorites key (Windows 2000 or later)")]
        BrowserFavorites = 0xAB,

        [Display(Name = "BrowserHome", Description = "The browser home key (Windows 2000 or later)")]
        BrowserHome = 0xAC,

        [Display(Name = "VolumeMute", Description = "The volume mute key (Windows 2000 or later)")]
        VolumeMute = 0xAD,

        [Display(Name = "VolumeDown", Description = "The volume down key (Windows 2000 or later)")]
        VolumeDown = 0xAE,

        [Display(Name = "VolumeUp", Description = "The volume up key (Windows 2000 or later)")]
        VolumeUp = 0xAF,

        [Display(Name = "MediaNextTrack", Description = "The media next track key (Windows 2000 or later)")]
        MediaNextTrack = 0xB0,

        [Display(Name = "MediaPreviousTrack", Description = "The media previous track key (Windows 2000 or later)")]
        MediaPreviousTrack = 0xB1,

        [Display(Name = "MediaStop", Description = "The media Stop key (Windows 2000 or later)")]
        MediaStop = 0xB2,

        [Display(Name = "MediaPlayPause", Description = "The media play pause key (Windows 2000 or later)")]
        MediaPlayPause = 0xB3,
    }

}
