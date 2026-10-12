/**
 * Capabilities a model can be enabled for, mirroring the backend ModelCapabilityEnum.
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
