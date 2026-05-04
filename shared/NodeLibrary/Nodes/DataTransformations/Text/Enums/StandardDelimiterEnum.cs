namespace NodeLibrary.TextNodes.Enums;

public enum StandardDelimiterEnum
{
    [Display(Name = "Tab", Description = "Splits text using the tab character (\t).")]
    Tab,

    [Display(Name = "New Line", Description = "Splits text using the newline character(s) (\r\n or \n).")]
    NewLine
}
