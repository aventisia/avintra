using CodeActivitiesLibrary.Extensions;
using Microsoft.Win32;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.WorkstationActivities
{
    //[DisplayName("Set Default Printer")]
    //[Description("Sets a printer as the default printer.")]
    //[ActivityMetaData(nodeImg: "/assets/Workstation.svg")]
    public class SetDefaultPrinterActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The name of the printer to set as default.")]
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
                        foreach (var printer in printersKey.GetSubKeyNames())
                            using (var printerKey = printersKey.OpenSubKey(printer, true))
                            {
                                if (printerKey is null) continue;
                                printerKey.SetValue("Default", printer == printerName ? 1 : 0, RegistryValueKind.DWord);
                            }
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Default printer set successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error setting default printer: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}