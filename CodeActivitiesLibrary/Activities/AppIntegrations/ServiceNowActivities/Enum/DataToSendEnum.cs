using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities.Enum
{
    //Moved enum outside method, with proper DisplayName and Description
    public enum DataToSendEnum
    {
        [Display(Name = "Nothing",
        Description = "Sends an empty request body. ServiceNow may auto-populate default values.")]
        Nothing,

        [Display(Name = "Auto-map Input Data",
        Description = "Automatically maps input arguments (e.g., ShortDescription) to matching ServiceNow fields.")]
        AutoMapInputData,

        [Display(Name = "Define Below for Each Column",
        Description = "Manually specify each field and its value in a list.")]
        DefineBelowForEachColumn
    }
}
