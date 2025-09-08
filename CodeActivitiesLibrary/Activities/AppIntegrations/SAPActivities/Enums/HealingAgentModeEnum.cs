using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities.Enums
{
    public enum HealingAgentModeEnum
    {
        [Display(Name = "Same as App/Browser", Description = "Uses the Healing Agent setting from the parent application or browser.")]
        SameAsAppBrowser,

        [Display(Name = "Inherit job settings", Description = "Uses job-level settings from Orchestrator or project settings.")]
        InheritJobSettings,

        [Display(Name = "Recommendation only", Description = "Allows Healing Agent to recommend fixes, but does not apply them.")]
        RecommendationOnly,

        [Display(Name = "Disabled", Description = "Healing Agent is completely disabled for this activity.")]
        Disabled
    }
}
