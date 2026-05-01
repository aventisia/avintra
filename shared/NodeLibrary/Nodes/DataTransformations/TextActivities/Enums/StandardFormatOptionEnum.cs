using System.ComponentModel.DataAnnotations;

namespace NodeLibrary.DataTransformations.TextActivities.Enums;

public enum StandardFormatOptionEnum
{
    [Display(Name = "Short Date", Description = "Displays a short date pattern, such as MM/dd/yyyy.")]
    ShortDate,

    [Display(Name = "Long Date",
        Description = "Displays a long date pattern, such as 'Wednesday, January 1, 2025'.")]
    LongDate,

    [Display(Name = "Short Time", Description = "Displays a short time pattern, such as hh:mm tt.")]
    ShortTime,

    [Display(Name = "Long Time", Description = "Displays a long time pattern, such as hh:mm:ss tt.")]
    LongTime,

    [Display(Name = "Full Date, Short Time",
        Description = "Displays the full date and short time, such as 'Monday, January 1, 2025 3:45 PM'.")]
    FullDatetimeShortTime,

    [Display(Name = "Full Date, Long Time",
        Description = "Displays the full date and long time, such as 'Monday, January 1, 2025 3:45:00 PM'.")]
    FullDatetimeLongTime,

    [Display(Name = "General Date, Short Time", Description = "General date with short time format.")]
    GeneralDatetimeShortTime,

    [Display(Name = "General Date, Long Time", Description = "General date with long time format.")]
    GeneralDatetimeLongTime,

    [Display(Name = "Sortable Datetime",
        Description = "A locale-independent sorted date-time format. ISO 8601 compatible.")]
    SortableDatetime
}
