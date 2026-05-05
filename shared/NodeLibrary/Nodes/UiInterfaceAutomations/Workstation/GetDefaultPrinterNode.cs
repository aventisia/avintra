using Microsoft.Win32;
using System.Management;
using System.Runtime.InteropServices;

namespace NodeLibrary.WorkstationNodes;

[DisplayName("Get Default Printer"), Description("Gets the name of the default printer using multiple methods.")]
[NodeMetadata(icon: "/assets/Workstation.svg")]
public class GetDefaultPrinterNode : BaseNode
{
    [DisplayName("Retrieval Method"), Description("Method to use for retrieving the default printer (Auto will try all methods)")]
    public InArgument<RetrievalMethodEnum> Method { get; set; } = new InArgument<RetrievalMethodEnum>(RetrievalMethodEnum.Auto);

    [DisplayName("Default Printer Name"), Description("Returns the name of the default printer.")]
    public OutArgument<string> DefaultPrinterName { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var method = Method.Get(context);
        var printerName = string.Empty;
        var success = false;
        var status = string.Empty;

        try
        {
            if (method == RetrievalMethodEnum.Auto || method == RetrievalMethodEnum.Win32Api)
            {
                try
                {
                    printerName = GetDefaultPrinterWin32();
                    success = true;
                }
                catch
                {
                    if (method == RetrievalMethodEnum.Win32Api)
                    {
                        throw;
                    }
                }
            }

            if ((method == RetrievalMethodEnum.Auto && !success) || method == RetrievalMethodEnum.Registry)
            {
                try
                {
                    printerName = GetDefaultPrinterFromRegistry();
                    success = true;
                }
                catch
                {
                    if (method == RetrievalMethodEnum.Registry)
                    {
                        throw;
                    }
                }
            }

            if ((method == RetrievalMethodEnum.Auto && !success) || method == RetrievalMethodEnum.WMI)
            {
                try
                {
                    printerName = GetDefaultPrinterFromWMI();
                    success = true;
                }
                catch
                {
                    if (method == RetrievalMethodEnum.WMI)
                    {
                        throw;
                    }
                }
            }

            if (!success)
            {
                throw new InvalidOperationException("Could not determine default printer using any available method");
            }

            DefaultPrinterName.Set(context, printerName);
            status = $"Successfully retrieved default printer '{printerName}'.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving default printer: {ex.Message}");
        }
    }

    private string GetDefaultPrinterFromRegistry()
    {
        using (var key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows NT\CurrentVersion\Windows"))
        {
            var printerName = key?.GetValue("Device")?.ToString();
            if (!string.IsNullOrEmpty(printerName))
            {
                return printerName.Split(',')[0];
            }
        }

        using (var key = Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Control\Print\Printers"))
        {
            if (key == null)
            {
                throw new InvalidOperationException("Default printer not found in registry");
            }

            foreach (var printer in key.GetSubKeyNames())
            {
                using (var printerKey = key.OpenSubKey(printer))
                {
                    if (printerKey?.GetValue("Default")?.ToString() == "1")
                    {
                        return printer;
                    }
                }
            }
        }

        throw new InvalidOperationException("Default printer not found in registry");
    }

    [DllImport("winspool.drv", CharSet = CharSet.Auto, SetLastError = true)]
    private static extern bool GetDefaultPrinter(StringBuilder pszBuffer, ref int pcchBuffer);

    private string GetDefaultPrinterWin32()
    {
        var bufferSize = 0;
        GetDefaultPrinter(null, ref bufferSize);

        if (bufferSize == 0)
        {
            throw new InvalidOperationException("Could not determine default printer (Win32 API failed)");
        }

        var buffer = new StringBuilder(bufferSize);
        if (!GetDefaultPrinter(buffer, ref bufferSize))
        {
            throw new InvalidOperationException($"Win32 API error: {Marshal.GetLastWin32Error()}");
        }

        return buffer.ToString();
    }

    private string GetDefaultPrinterFromWMI()
    {
        const string query = "SELECT * FROM Win32_Printer WHERE Default = TRUE";
        using (var searcher = new ManagementObjectSearcher(query))
        using (var collection = searcher.Get())
        {
            foreach (ManagementObject printer in collection)
            {
                return printer["Name"].ToString();
            }
        }

        throw new InvalidOperationException("No default printer found via WMI");
    }

    public enum RetrievalMethodEnum
    {
        [Display(Name = "Auto", Description = "Automatically tries all methods in order of preference.")]
        Auto,

        [Display(Name = "Registry", Description = "Retrieves the default printer from the Windows Registry.")]
        Registry,

        [Display(Name = "Win32 API", Description = "Retrieves the default printer using Win32 API calls.")]
        Win32Api,

        [Display(Name = "WMI", Description = "Retrieves the default printer using WMI queries.")]
        WMI
    }
}
