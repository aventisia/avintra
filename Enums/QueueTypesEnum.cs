namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing the different roles or types of entities that can be associated with a queue.
/// </summary>
/// <remarks>
/// This enum is used to differentiate between various types of participants in a queue. 
/// It allows the system to categorize and handle users and agents differently within the context of queue management.
/// </remarks>
public enum QueueTypesEnum
{
    /// <summary>
    /// Represents an agent who is part of the queue, typically a support or service representative.
    /// </summary>
    [Description("Represents an agent (such as a support or service representative) in the queue.")]
    Agent,

    /// <summary>
    /// Represents a user who is part of the queue, typically a customer or client.
    /// </summary>
    [Description("Represents a user (typically a customer or client) in the queue.")]
    User
}
