using System;
using System.Windows;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers
{
    /// <summary>
    /// Provides utility methods for UI Automation tasks, such as retrieving the current mouse position.
    /// </summary>
    public static class UIAutomationHelper
    {
        /// <summary>
        /// Struct representing a point (x, y) in Win32 API.
        /// </summary>
        [StructLayout(LayoutKind.Sequential)]
        internal struct Win32Point
        {
            public int X;
            public int Y;
        }

        /// <summary>
        /// Retrieves the current mouse cursor position on the screen.
        /// </summary>
        /// <returns>
        /// A <see cref="System.Windows.Point"/> representing the current mouse position.
        /// </returns>
        public static Point GetMousePosition()
        {
            Point point = new Point();
            try
            {
                var win32Point = new Win32Point();
                if (GetCursorPos(ref win32Point))
                {
                    point = new Point(win32Point.X, win32Point.Y);
                }
            }
            catch (Exception ex)
            {
                // Log or handle exception as needed
                Console.WriteLine(ex.ToString());
            }
            return point;
        }

        /// <summary>
        /// Calls the Win32 API to get the cursor position.
        /// </summary>
        /// <param name="pt">Reference to a <see cref="Win32Point"/> struct to receive the position.</param>
        /// <returns>True if successful, otherwise false.</returns>
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool GetCursorPos(ref Win32Point pt);
    }
}