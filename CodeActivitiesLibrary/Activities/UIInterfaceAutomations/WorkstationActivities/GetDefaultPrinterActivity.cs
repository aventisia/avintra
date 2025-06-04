using CodeActivitiesLibrary.Extensions;
using Microsoft.Win32;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.WorkstationActivities
{
    [DisplayName("Get Default Printer")]
    [Description("Gets the name of the default printer.")]
    public class GetDefaultPrinterActivity : BaseCodeActivity
    {

        [Description("Returns the name of the default printer.")]
        public OutArgument<string> DefaultPrinterName { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var defaultPrinterName = "";
            var status = "";

            try
            {
                using (var key =
                       Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Control\Print\Printers"))
                {
                    if (key != null)
                        foreach (var printer in key.GetSubKeyNames())
                            using (var printerKey = key.OpenSubKey(printer))
                            {
                                if (printerKey.GetValue("Default")?.ToString() == "1")
                                {
                                    defaultPrinterName = printer;
                                    break;
                                }
                            }
                }

                StatusMessage.Set(context, "Default printer retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving default printer: {ex.Message}";
            }

            DefaultPrinterName.Set(context, defaultPrinterName);
            StatusMessage.Set(context, status);
        }
    }
}