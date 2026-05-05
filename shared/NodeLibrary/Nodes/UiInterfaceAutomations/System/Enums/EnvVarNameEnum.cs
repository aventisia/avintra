namespace NodeLibrary.SystemNodes.Enums;

public enum EnvVarNameEnum
{
    [Display(Name = "Number of Processors", Description = "Number of Processors")]
    NUMBER_OF_PROCESSORS,

    [Display(Name = "Operating System", Description = "Operating System")]
    OS,

    [Display(Name = "Path", Description = "System Path")]
    PATH,

    [Display(Name = "Path Extensions", Description = "Path Extensions")]
    PATHEXT,

    [Display(Name = "Processor Architecture", Description = "Processor Architecture")]
    PROCESSOR_ARCHITECTURE,

    [Display(Name = "Processor Identifier", Description = "Processor Identifier")]
    PROCESSOR_IDENTIFIER,

    [Display(Name = "Processor Level", Description = "Processor Level")]
    PROCESSOR_LEVEL,

    [Display(Name = "Processor Revision", Description = "Processor Revision")]
    PROCESSOR_REVISION,

    [Display(Name = "PowerShell Module Path", Description = "PowerShell Module Path")]
    PSMODULEPATH,

    [Display(Name = "Temporary Directory", Description = "Temporary Directory")]
    TEMP,

    [Display(Name = "TMP Directory", Description = "TMP Directory")]
    TMP,

    [Display(Name = "Username", Description = "Current User's Username")]
    USERNAME,

    [Display(Name = "Windows Directory", Description = "Windows Directory")]
    WINDIR,

    [Display(Name = "ZES Enable Sysman", Description = "ZES Enable Sysman")]
    ZES_ENABLE_SYSMAN,

    [Display(Name = "Unknown", Description = "Unknown Environment Variable")]
    None,

    [Display(Name = "OneDrive", Description = "OneDrive environment variable")]
    OneDrive,

    [Display(Name = "OneDrive Commercial", Description = "OneDrive Commercial environment variable")]
    OneDriveCommercial,

    [Display(Name = "OneDrive Consumer", Description = "OneDrive Consumer environment variable")]
    OneDriveConsumer,
}
