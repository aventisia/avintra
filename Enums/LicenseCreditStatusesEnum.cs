using System.ComponentModel;

namespace AccountsAPIs.Enums
{
    public enum LicenseCreditStatusesEnum
    {
        [Description("Requested for approval")]
        Requested,

        [Description("Pending approval")]
        Pending,

        [Description("Approved for use")]
        Approved,

        [Description("Rejected and not usable")]
        Rejected,

        [Description("Expired and no longer valid")]
        Expired
    }
}
