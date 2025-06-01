using System;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers
{
    /// <summary>
    /// Provides helper methods for mouse actions, such as moving the cursor and simulating mouse clicks.
    /// </summary>
    public static class MouseHelper
    {
        // Import SetCursorPos from user32.dll to set the mouse cursor position.
        [DllImport("user32.dll")]
        internal static extern bool SetCursorPos(int x, int y);

        // Import mouse_event from user32.dll to simulate mouse events.
        [DllImport("user32.dll")]
        public static extern void mouse_event(int dwFlags, int dx, int dy, int cButtons, int dwExtraInfo);

        // Mouse event constants for different mouse actions.
        public const int MOUSEEVENTF_LEFTDOWN = 0x02;
        public const int MOUSEEVENTF_LEFTUP = 0x04;
        public const int MOUSEEVENTF_RIGHTDOWN = 0x08;
        public const int MOUSEEVENTF_RIGHTUP = 0x10;

        /// <summary>
        /// Simulates a mouse click at the specified screen coordinates.
        /// </summary>
        /// <param name="clickType">Type of click: "Left Click", "Right Click", "Double Click", "Left Click Down", "Left Click Up", "Right Click Down", "Right Click Up".</param>
        /// <param name="xPosition">The X coordinate on the screen.</param>
        /// <param name="yPosition">The Y coordinate on the screen.</param>
        public static void SendMouseClick(string clickType, double xPosition, double yPosition)
        {
            try
            {
                // Move the cursor to the specified position.
                SetCursorPos(Convert.ToInt32(xPosition), Convert.ToInt32(yPosition));

                // Perform the specified mouse action.
                switch (clickType)
                {
                    case "Left Click":
                        mouse_event(MOUSEEVENTF_LEFTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        mouse_event(MOUSEEVENTF_LEFTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        break;
                    case "Right Click":
                        mouse_event(MOUSEEVENTF_RIGHTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        mouse_event(MOUSEEVENTF_RIGHTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        break;
                    case "Double Click":
                        mouse_event(MOUSEEVENTF_LEFTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        mouse_event(MOUSEEVENTF_LEFTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        mouse_event(MOUSEEVENTF_LEFTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        mouse_event(MOUSEEVENTF_LEFTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        break;
                    case "Left Click Down":
                        mouse_event(MOUSEEVENTF_LEFTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        break;
                    case "Left Click Up":
                        mouse_event(MOUSEEVENTF_LEFTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        break;
                    case "Right Click Down":
                        mouse_event(MOUSEEVENTF_RIGHTDOWN, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        break;
                    case "Right Click Up":
                        mouse_event(MOUSEEVENTF_RIGHTUP, Convert.ToInt32(xPosition), Convert.ToInt32(yPosition), 0, 0);
                        break;
                }
            }
            catch (Exception ex)
            {
                // Log or handle exception as needed.
                Console.WriteLine(ex.ToString());
            }
        }
    }
}