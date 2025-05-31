using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities
{
    public enum IfExistsActionEnum
    {
        [Display(Name = "Do nothing", Description = "Skips the file if it already exists.")]
        DoNothing,

        [Display(Name = "Overwrite", Description = "Overwrites the existing file.")]
        Overwrite,
    }
}
