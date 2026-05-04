namespace NodeLibrary.TextNodes.Enums;

public enum FormatOptionEnum
{
    [Display(Name = "Standard Format", Description = "Uses one of the predefined date/time formats.")]
    Standard,

    [Display(Name = "Custom Format", Description = "Allows defining a custom date/time pattern.")]
    Custom
}
