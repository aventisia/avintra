/**
 * Capabilities a model can be enabled for.
 *
 * IMPORTANT NOTE: Any changes to this file should be manually synced with the back-end
 * `ModelCapabilityEnum` and the LLM pipeline provider capabilities.
 */
export enum ModelCapabilityEnum {
  Text = "Text",
  Embedding = "Embedding",
  Tts = "Tts",
  Stt = "Stt",
  ImageGeneration = "ImageGeneration",
  ImageEdit = "ImageEdit",
  VideoGeneration = "VideoGeneration",
  Moderation = "Moderation",
  Ocr = "Ocr",
  Realtime = "Realtime",
  Rerank = "Rerank",
  Responses = "Responses",
  Search = "Search",
  VectorStore = "VectorStore",
}
