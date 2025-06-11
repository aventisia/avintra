using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities.Enums
{
    // Define the ServiceNameEnum with Display attributes
    public enum ServiceNameEnum
    {
        [Display(Name = "Remote Procedure Call (RPC) Locator", Description = "Remote Procedure Call (RPC) Locator service.")]
        RemoteProcedureCallRpcLocator,

        [Display(Name = "Remote Registry", Description = "Remote Registry service.")]
        RemoteRegistry,

        [Display(Name = "Retail Demo Service", Description = "Retail Demo Service.")]
        RetailDemoService,

        [Display(Name = "Routing and Remote Access", Description = "Routing and Remote Access service.")]
        RoutingAndRemoteAccess,

        [Display(Name = "RPC Endpoint Mapper", Description = "RPC Endpoint Mapper service.")]
        RpcEndpointMapper,

        [Display(Name = "Secondary Logon", Description = "Secondary Logon service.")]
        SecondaryLogon,

        [Display(Name = "Secure Socket Tunneling Protocol Service", Description = "Secure Socket Tunneling Protocol Service.")]
        SecureSocketTunnelingProtocolService,

        [Display(Name = "Security Accounts Manager", Description = "Security Accounts Manager service.")]
        SecurityAccountsManager,

        [Display(Name = "Shell Hardware Detection", Description = "Shell Hardware Detection service.")]
        ShellHardwareDetection,

        [Display(Name = "Software Protection", Description = "Software Protection service.")]
        SoftwareProtection,

        [Display(Name = "Spatial Data Service", Description = "Spatial Data Service.")]
        SpatialDataService,

        [Display(Name = "Spot Verifier", Description = "Spot Verifier service.")]
        SpotVerifier,

        [Display(Name = "SQL Server (MSSQLSERVER)", Description = "SQL Server (MSSQLSERVER) service.")]
        SqlServerMssqlserver,

        [Display(Name = "SQL Server Agent (MSSQLSERVER)", Description = "SQL Server Agent (MSSQLSERVER) service.")]
        SqlServerAgentMssqlserver,

        [Display(Name = "SQL Server Browser", Description = "SQL Server Browser service.")]
        SqlServerBrowser,

        [Display(Name = "SQL Server CEIP service (MSSQLSERVER)", Description = "SQL Server Customer Experience Improvement Program (CEIP) service (MSSQLSERVER).")]
        SqlServerCeipServiceMssqlserver,

        [Display(Name = "SQL Server VSS Writer", Description = "SQL Server VSS Writer service.")]
        SqlServerVssWriter,

        [Display(Name = "State Repository Service", Description = "State Repository Service.")]
        StateRepositoryService,

        [Display(Name = "Still Image Acquisition Events", Description = "Still Image Acquisition Events service.")]
        StillImageAcquisitionEvents,

        [Display(Name = "Storage Service", Description = "Storage Service.")]
        StorageService,

        [Display(Name = "Storage Tiers Management", Description = "Storage Tiers Management service.")]
        StorageTiersManagement,

        [Display(Name = "Sync Host_a4ace5d", Description = "Sync Host_a4ace5d service.")]
        SyncHostA4Ace5d,

        [Display(Name = "SysMain", Description = "SysMain service.")]
        SysMain,

        [Display(Name = "System Event Notification Service", Description = "System Event Notification Service.")]
        SystemEventNotificationService,

        [Display(Name = "System Events Broker", Description = "System Events Broker service.")]
        SystemEventsBroker,

        [Display(Name = "Task Scheduler", Description = "Task Scheduler service.")]
        TaskScheduler,

        [Display(Name = "TCP/IP NetBIOS Helper", Description = "TCP/IP NetBIOS Helper service.")]
        TcpIpNetbiosHelper,

        [Display(Name = "Telephony", Description = "Telephony service.")]
        Telephony,

        [Display(Name = "Themes", Description = "Themes service.")]
        Themes,

        [Display(Name = "Time Broker", Description = "Time Broker service.")]
        TimeBroker,

        [Display(Name = "Touch Keyboard and Handwriting Panel Service", Description = "Touch Keyboard and Handwriting Panel Service.")]
        TouchKeyboardAndHandwritingPanelService,

        [Display(Name = "Udk User Service_a4ace5d", Description = "Udk User Service_a4ace5d service.")]
        UdkUserServiceA4Ace5d,

        [Display(Name = "Update Orchestrator Service", Description = "Update Orchestrator Service.")]
        UpdateOrchestratorService,

        [Display(Name = "UPnP Device Host", Description = "UPnP Device Host service.")]
        UpnpDeviceHost,

        [Display(Name = "User Data Access_a4ace5d", Description = "User Data Access_a4ace5d service.")]
        UserDataAccessA4Ace5d,

        [Display(Name = "User Data Storage_a4ace5d", Description = "User Data Storage_a4ace5d service.")]
        UserDataStorageA4Ace5d,

        [Display(Name = "User Experience Virtualization Service", Description = "User Experience Virtualization Service.")]
        UserExperienceVirtualizationService
    }
}