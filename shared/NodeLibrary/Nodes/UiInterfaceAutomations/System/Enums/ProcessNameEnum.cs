namespace NodeLibrary.SystemNodes.Enums;

public enum ProcessNameEnum
{
    [Display(Name = "Aggregator Host", Description = "Aggregator Host service.")]
    AggregatorHost,

    [Display(Name = "Application Message Forwarder", Description = "Forwards application messages.")]
    ApMsgFwd,

    [Display(Name = "AP Notification Executor", Description = "Executes AP notifications.")]
    ApntEx,

    [Display(Name = "Apoint Service", Description = "Apoint background service.")]
    Apoint,

    [Display(Name = "Generic Application", Description = "Standard application process.")]
    App,

    [Display(Name = "Remote AP Service", Description = "Remote access AP service.")]
    ApRemote,

    [Display(Name = "Windows Audio Device Graph Isolation", Description = "Manages audio isolation.")]
    Audiodg,

    [Display(Name = "Google Chrome Browser", Description = "Google Chrome browser instance.")]
    Chrome,

    [Display(Name = "Copilot Language Server", Description = "Language server for Copilot integration.")]
    CopilotLanguageServer,

    [Display(Name = "Client/Server Runtime Subsystem", Description = "Core Windows subsystem process.")]
    Csrss,

    [Display(Name = "Input Method Editor", Description = "IME support for input methods.")]
    Ctfmon,

    [Display(Name = "Device Association Service Host", Description = "Handles device associations.")]
    DasHost,

    [Display(Name = "Visual Studio Development Environment", Description = "Visual Studio IDE process.")]
    Devenv,

    [Display(Name = "COM Surrogate", Description = "Runs COM objects outside of host process.")]
    Dllhost,

    [Display(Name = "File Co-Authoring Service", Description = "Supports real-time document co-editing.")]
    FileCoAuth,

    [Display(Name = "Font Driver Host", Description = "Manages font drivers.")]
    Fontdrvhost,

    [Display(Name = "Human Interface Device Monitor", Description = "Monitors HID devices.")]
    HidMonitorSvc,

    [Display(Name = "Intel Bluetooth Service", Description = "Intel Bluetooth support service.")]
    IbtSiva,

    [Display(Name = "Idle Process", Description = "Represents idle CPU time.")]
    Idle,

    [Display(Name = "Intel Content Protection Service", Description = "Manages Intel HDCP content protection.")]
    IntelCpHDCPSvc
}
