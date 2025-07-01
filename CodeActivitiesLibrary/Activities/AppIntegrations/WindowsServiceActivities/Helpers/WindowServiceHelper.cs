using CodeActivitiesLibrary.AppIntegrations.WindowsServiceActivities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.Activities.AppIntegrations.WindowsServiceActivities.Helpers
{
    public class WindowServiceHelper
    {
        public static bool IsUserAdministrator()
        {
            try
            {
                var identity = System.Security.Principal.WindowsIdentity.GetCurrent();
                var principal = new System.Security.Principal.WindowsPrincipal(identity);
                return principal.IsInRole(System.Security.Principal.WindowsBuiltInRole.Administrator);
            }
            catch
            {
                return false;
            }
        }

        public static string GetActualServiceName(ServiceNameEnum serviceName)
        {
            switch (serviceName)
            {
                case ServiceNameEnum.SqlServerVssWriter:
                    return "VSSWriter";

                case ServiceNameEnum.SqlServerMssqlserver:
                    return "MSSQLSERVER";

                case ServiceNameEnum.SqlServerAgentMssqlserver:
                    return "SQLSERVERAGENT";

                case ServiceNameEnum.SqlServerBrowser:
                    return "SQLBROWSER";

                case ServiceNameEnum.SqlServerCeipServiceMssqlserver:
                    return "SQLCEIP";

                case ServiceNameEnum.TaskScheduler:
                    return "Schedule";

                case ServiceNameEnum.SysMain:
                    return "SysMain";

                case ServiceNameEnum.SecondaryLogon:
                    return "seclogon";

                case ServiceNameEnum.RemoteRegistry:
                    return "RemoteRegistry";

                default:
                    return serviceName.ToString();
            }
        }
    }
}
