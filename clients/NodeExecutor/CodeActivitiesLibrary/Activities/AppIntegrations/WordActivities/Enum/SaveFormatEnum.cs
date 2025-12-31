using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.WordActivities.Enum
{
    public enum SaveFormatEnum
    {
        [Display(Name = ".docx", Description = "Saves the document as a Word file.")]
        Docx,

        [Display(Name = ".pdf", Description = "Saves the document as a PDF file.")]
        Pdf
    }
}
