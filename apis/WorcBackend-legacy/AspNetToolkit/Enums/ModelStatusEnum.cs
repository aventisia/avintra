namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the model library status list. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum ModelStatusEnum
{
    Annotation,
    InTraining,
    Trained,
    InTesting,
    Active,
    Executing,
    Inactive,
}