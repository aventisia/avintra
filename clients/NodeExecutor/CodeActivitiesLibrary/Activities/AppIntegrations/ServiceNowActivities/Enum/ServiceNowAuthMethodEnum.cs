using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities.Enum
{
    public enum ServiceNowAuthMethodEnum
    {
        [Display(Name = "Basic Auth", Description = "Authenticate using Basic Authentication.")]
        BasicAuth,

        [Display(Name = "OAuth2", Description = "Authenticate using OAuth 2.0.")]
        OAuth2
    }
}
