using System;
using System.Activities;
using System.ComponentModel;
using Microsoft.Win32;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Set Default Printer"), Description("Sets a printer as the default printer.")]
    public class SetDefaultPrinterActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The name of the printer to set as default.")]
        public InArgument<string> PrinterName { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var printerName = PrinterName.Get(context);
            var status = "";

            try
            {
                using (var printersKey =
                       Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Control\Print\Printers", true))
                {
                    if (printersKey != null)
                    {
                        foreach (var printer in printersKey.GetSubKeyNames())
                        {
                            using (var printerKey = printersKey.OpenSubKey(printer, true))
                            {
                                if (printer == printerName)
                                {
                                    printerKey.SetValue("Default", 1, RegistryValueKind.DWord);
                                }
                                else
                                {
                                    printerKey.SetValue("Default", 0, RegistryValueKind.DWord);
                                }
                            }
                        }
                    }
                }

                StatusMessage.Set(context, "Default printer set successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error setting default printer: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}