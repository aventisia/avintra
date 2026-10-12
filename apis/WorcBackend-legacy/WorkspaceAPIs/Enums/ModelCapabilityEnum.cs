namespace WorkspaceAPIs.Enums;

/// <summary>
/// Represents the capabilities a model can be enabled for, mirroring the LLM pipeline provider capabilities.
/// </summary>
public enum ModelCapabilityEnum
{
    Text,
    Embedding,
    Tts,
    Stt,
    ImageGeneration,
    ImageEdit,
    VideoGeneration,
    Moderation,
    Ocr,
    Realtime,
    Rerank,
    Responses,
    Search,
    VectorStore,
}
