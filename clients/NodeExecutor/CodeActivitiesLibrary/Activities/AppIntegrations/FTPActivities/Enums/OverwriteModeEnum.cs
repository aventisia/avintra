using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.Activities.AppIntegrations.FTPActivities.Enums
{
    public enum OverwriteModeEnum
    {
        [Display(Name = "Always", Description = "Always overwrite files.")]
        Always,

        [Display(Name = "Never", Description = "Never overwrite files.")]
        Never,

        [Display(Name = "If newer", Description = "Overwrite if remote file is newer.")]
        IfNewer,

        [Display(Name = "If size different", Description = "Overwrite if file sizes differ.")]
        IfSizeDifferent,

        [Display(Name = "If newer or size different", Description = "Overwrite if remote is newer or size differs.")]
        IfNewerOrSizeDifferent
    }
}
