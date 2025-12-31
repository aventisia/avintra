using FlaUI.Core.AutomationElements;
using FlaUI.Core.Exceptions;
using System;
using System.Drawing;
using System.Threading.Tasks;

namespace UIInspector.Core
{
    public static class ElementHighlighter
    {
        public static void HighlightElement(AutomationElement automationElement)
        {
            try
            {
                Task.Run(() => automationElement.DrawHighlight(false, Color.Red, TimeSpan.FromSeconds(1)));
            }
            catch (PropertyNotSupportedException ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
            }
        }
    }
}
