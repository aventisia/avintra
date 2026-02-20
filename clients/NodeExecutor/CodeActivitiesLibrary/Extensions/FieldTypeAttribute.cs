using System;

namespace CodeActivitiesLibrary.Extensions
{
    public enum FieldType
    {
        Number,
        Email,
        File,
        Color,
        Date,
        Time,
        Password,
        DateTime,
        Text,
        Textarea,
        Select,
        Switch,
        ConditionGroups,
        ConfigPanelOutput,
        ModelSelect,
        CredentialsSelect,
        QueueSelect,
        JsonEditor,
        ConfigPanelModelOutput
    }

    /// <summary>
    /// Indicates the field type for an argument property.
    /// Should only be applied to properties of type InArgument.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public class FieldTypeAttribute : Attribute
    {
        public FieldType InputFieldType { get; }

        public FieldTypeAttribute(FieldType inputFieldType)
        {
            InputFieldType = inputFieldType;
        }
    }
}