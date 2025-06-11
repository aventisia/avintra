using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities.Enums
{
    // Enum for specifying how the attribute value should be returned
    public enum GetValueAsEnum
    {
        [Description("Returns the attribute value as plain text.")]
        TextValue,

        [Description("Parses the attribute value into a numeric (double) format.")]
        NumericValue,

        [Description("Parses the attribute value into a DateTime format.")]
        DateTimeValue,

        [Description("Parses the attribute value into a Boolean (true/false) format.")]
        BooleanValue
    }
}