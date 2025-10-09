using System;

namespace CodeActivitiesLibrary.Extensions
{
    public enum FieldType
    {
        Number,
        Email,
        File,
        Color,
        Time,
        Password,
        Text,
        Textarea,
        Select,
        Switch,
        ConditionGroups,
        ConfigPanelOutput,
        ModelSelect,
        CredentialsSelect,
        ConfigPanelModelOutput
    }

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