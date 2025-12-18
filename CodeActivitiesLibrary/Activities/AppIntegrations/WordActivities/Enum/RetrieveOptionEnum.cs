using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities.Enum
{
    public enum RetrieveOptionEnum
    {
        [Display(Name = "Whole Document", Description = "Retrieves the entire content of the document.")]
        WholeDocument,

        [Display(Name = "Pages", Description = "Retrieves content based on specified page numbers.")]
        Pages,

        [Display(Name = "Bookmark", Description = "Retrieves content located within a specific bookmark.")]
        Bookmark
    }
}
