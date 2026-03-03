using System;

namespace CodeActivitiesLibrary.Extensions
{
    // Note: Not keeping Password as a separate field type since it will be identified by the DataType "SecureString" on the InArgument property and handled accordingly in the UI rendering logic.
    public enum FieldType
    {
        Number,
        Email,
        File,
        Color,
        Date,
        Time,
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
        public FieldType FieldType { get; }

        public FieldTypeAttribute(FieldType fieldType)
        {
            FieldType = fieldType;
        }
    }
}