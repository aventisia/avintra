namespace NodeLibrary.Enums;

public enum ComparisonOperatorEnum
{
    // Operators for any type (primitive or objects)
    [Display(Name = "Is Equal To", Description = "Checks if the first value is equal to the second value.")]
    EqualTo,

    [Display(Name = "Is Not Equal To", Description = "Checks if the first value is not equal to the second value.")]
    NotEqualTo,

    // Operators for Text
    [Display(Name = "Text Starts With", Description = "Checks if the text starts with the given value.")]
    TextStartsWith,

    [Display(Name = "Text Does Not Start With", Description = "Checks if the text does not start with the given value.")]
    TextDoesNotStartWith,

    [Display(Name = "Text Ends With", Description = "Checks if the text ends with the given value.")]
    TextEndsWith,

    [Display(Name = "Text Does Not End With", Description = "Checks if the text does not end with the given value.")]
    TextDoesNotEndWith,

    [Display(Name = "Text Contains", Description = "Checks if the text contains the given value.")]
    TextContains,

    [Display(Name = "Text Does Not Contain", Description = "Checks if the text does not contain the given value.")]
    TextDoesNotContain,

    // Operators for List
    [Display(Name = "List Contains", Description = "Checks if the list contains the given item.")]
    ListContains,

    [Display(Name = "List Does Not Contain", Description = "Checks if the list does not contain the given item.")]
    ListDoesNotContain,

    [Display(Name = "Is List Empty", Description = "Checks if the list is empty.")]
    IsListEmpty,

    [Display(Name = "Is List Not Empty", Description = "Checks if the list is not empty.")]
    IsListNotEmpty,

    // Operators for Numbers and DateTimes
    [Display(Name = "Is Greater Than", Description = "Checks if the first value is greater than the second value.")]
    GreaterThan,

    [Display(Name = "Is Less Than", Description = "Checks if the first value is less than the second value.")]
    LessThan,

    [Display(Name = "Is Greater Than Or Equal To", Description = "Checks if the first value is greater than or equal to the second value.")]
    GreaterThanOrEqualTo,

    [Display(Name = "Is Less Than Or Equal To", Description = "Checks if the first value is less than or equal to the second value.")]
    LessThanOrEqualTo,

    // Operators for File
    [Display(Name = "File Exists", Description = "Checks if the file exists.")]
    FileExists,

    [Display(Name = "File Does Not Exist", Description = "Checks if the file does not exist.")]
    FileDoesNotExist,
}
