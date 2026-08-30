namespace NodeLibrary.MessageBoxNodes.Enums;

public enum DialogTypeEnum
{
    [Display(Name = "Single Date", Description = "Allows selection of a single date.")]
    SingleDate,

    [Display(Name = "Date Range", Description = "Allows selection of a start and end date.")]
    DateRange
}

public enum PromptForEnum
{
    [Display(Name = "Date Only", Description = "Prompts the user to select a date only.")]
    DateOnly,

    [Display(Name = "Date and Time", Description = "Prompts the user to select both date and time.")]
    DateAndTime
}
