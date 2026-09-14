namespace NodeLibrary.Enums;

// Note: Not keeping Password as a separate field type since it will be identified by the DataType 
// "SecureString" on the InArgument property and handled accordingly in the UI rendering logic.
public enum NodeFieldTypeEnum
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
    QueueStatusSelect,
    JsonEditor,
    CodeEditor,
    ConfigPanelModelOutput
}