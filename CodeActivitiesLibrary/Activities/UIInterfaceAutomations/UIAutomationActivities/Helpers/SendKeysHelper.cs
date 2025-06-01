using System;
using System.Threading;
using System.Windows.Forms;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities.Helpers
{
    public static class SendKeysHelper
    {
        /// <summary>
        /// Simulates typing text character by character with a delay between each character,
        /// handling special SendKeys characters.
        /// </summary>
        /// <param name="text">The text to type.</param>
        /// <param name="delayMs">Delay in milliseconds between each character.</param>
        public static void SendKeysTyping(string text, int delayMs)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(text))
                {
                    string specialSendKeysChar = "+^%~(){}[]";
                    foreach (char letter in text)
                    {
                        if (specialSendKeysChar.Contains(letter.ToString()))
                            SendKeys.SendWait("{" + letter.ToString() + "}");
                        else
                            SendKeys.SendWait(letter.ToString());
                        Thread.Sleep(delayMs);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}