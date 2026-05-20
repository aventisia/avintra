using Microsoft.Win32;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Set Default Printer"), Description("Sets a printer as the default printer.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class SetDefaultPrinterNode : BaseNode
{
    [DisplayName("Printer Name"), Description("The name of the printer to set as default.")]
    public required InArgument<string> PrinterName { get; set; }

    protected override void Execute(INodeContext context)
    {
        var printerName = PrinterName.Get(context);
        var status = string.Empty;

        try
        {
            using (var printersKey = Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Control\Print\Printers", true))
            {
                if (printersKey != null)
                {
                    foreach (var printer in printersKey.GetSubKeyNames())
                    {
                        using var printerKey = printersKey.OpenSubKey(printer, true);
                        if (printerKey is null)
                        {
                            continue;
                        }

                        printerKey.SetValue("Default", printer == printerName ? 1 : 0, RegistryValueKind.DWord);
                    }
                }
            }

            status = "Default printer set successfully.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error setting default printer: {ex.Message}");
        }
    }
}
