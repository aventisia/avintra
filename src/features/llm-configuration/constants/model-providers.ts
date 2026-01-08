export type Model = {
  /* Value of the model that can be passed to llm  */
  value: string;

  /* Name(which is officially used) of the Model */
  label: string;

  /* A check kept to display the model in list to user*/
  available: boolean;

  /* If model has capability to response in voice then its associated voice names*/
  voices?: { label: string; value: string }[];

  /* Specialty of the model*/
  specialty: (
    | "text"
    | "vision"
    | "image"
    | "tts"
    | "stt"
    | "video"
    | "realtime"
    | "deep-search"
  )[];
};

export type Provider = {
  /* Value of the Provider that can be passed to llm */
  value: string;

  /* Name(which is officially used) of the Provider */
  label: string;

  /* Models that come under the provider */
  models: Model[];

  /* A check kept to display the provider in list to user*/
  isEnabled?: boolean;
};

// Mark available for the models that are provided on the platform
//open ai , deep infra, gemini

const openAIVoices = [
  { label: "Alloy", value: "alloy" },
  { label: "Echo", value: "echo" },
  { label: "Fable", value: "fable" },
  { label: "Onyx", value: "onyx" },
  { label: "Nova", value: "nova" },
  { label: "Shimmer", value: "shimmer" },
];
// Official Google Gemini Live / TTS Voices (2025)
const googleVoices = [
  { label: "Journey", value: "journey" },
  { label: "Horizon", value: "horizon" },
  { label: "Lyra", value: "lyra" },
  { label: "Charon", value: "charon" },
  { label: "Kore", value: "kore" },
  { label: "Puck", value: "puck" },
  { label: "Fenrir", value: "fenrir" },
];

export const openAiModelList: Model[] = [
  // --- GPT-5 Frontier Series ---
  {
    label: "gpt-5.2",
    value: "gpt-5.2",
    available: false,
    specialty: ["text"],
    voices: openAIVoices,
  },
  {
    label: "gpt-5.1",
    value: "gpt-5.1",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gpt-5",
    value: "gpt-5",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gpt-5-mini",
    value: "gpt-5-mini",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gpt-5-nano",
    value: "gpt-5-nano",
    available: false,
    specialty: ["text"],
  },

  // --- Sora Video Series ---
  { label: "sora-2", value: "sora-2", available: false, specialty: ["video"] },
  {
    label: "sora-2-pro",
    value: "sora-2-pro",
    available: false,
    specialty: ["video"],
  },

  // --- Image Generation ---
  {
    label: "gpt-image-1.5",
    value: "gpt-image-1.5",
    available: false,
    specialty: ["image"],
  },
  {
    label: "chatgpt-image-latest",
    value: "chatgpt-image-latest",
    available: false,
    specialty: ["image"],
  },
  {
    label: "gpt-image-1",
    value: "gpt-image-1",
    available: false,
    specialty: ["image"],
  },
  {
    label: "gpt-image-1-mini",
    value: "gpt-image-1-mini",
    available: false,
    specialty: ["image"],
  },

  // --- Deep Research ---
  {
    label: "o3-deep-research",
    value: "o3-deep-research",
    available: false,
    specialty: ["deep-search"],
  },
  {
    label: "o4-mini-deep-research",
    value: "o4-mini-deep-research",
    available: false,
    specialty: ["deep-search"],
  },

  // --- Reasoning / Planning ---
  {
    label: "o3-pro",
    value: "o3-pro",
    available: false,
    specialty: ["text"],
  },
  { label: "o3", value: "o3", available: false, specialty: ["text"] },
  {
    label: "o4-mini",
    value: "o4-mini",
    available: false,
    specialty: ["text"],
  },

  // --- Audio & Realtime ---
  {
    label: "gpt-audio",
    value: "gpt-audio",
    available: false,
    specialty: ["tts"],
    voices: openAIVoices,
  },
  {
    label: "gpt-realtime",
    value: "gpt-realtime",
    available: false,
    specialty: ["realtime"],
    voices: openAIVoices,
  },
  {
    label: "gpt-realtime-mini",
    value: "gpt-realtime-mini",
    available: false,
    specialty: ["realtime"],
    voices: openAIVoices,
  },
  {
    label: "gpt-audio-mini",
    value: "gpt-audio-mini",
    available: false,
    specialty: ["tts"],
    voices: openAIVoices,
  },

  // --- GPT-4.x ---
  {
    label: "gpt-4.1",
    value: "gpt-4.1",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gpt-4.1-mini",
    value: "gpt-4.1-mini",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gpt-4.1-nano",
    value: "gpt-4.1-nano",
    available: false,
    specialty: ["text"],
  },

  // --- Special / Preview ---
  {
    label: "o1-pro",
    value: "o1-pro",
    available: false,
    specialty: ["text"],
  },
  {
    label: "computer-use-preview",
    value: "computer-use-preview",
    available: false,
    specialty: ["vision"],
  },
  {
    label: "gpt-4o-mini-search-preview",
    value: "gpt-4o-mini-search-preview",
    available: false,
    specialty: ["deep-search"],
  },
  {
    label: "gpt-4o-search-preview",
    value: "gpt-4o-search-preview",
    available: false,
    specialty: ["deep-search"],
  },
  {
    label: "gpt-4.5-preview",
    value: "gpt-4.5-preview",
    available: false,
    specialty: ["text"],
  },
  {
    label: "o3-mini",
    value: "o3-mini",
    available: false,
    specialty: ["text"],
  },
  { label: "o1", value: "o1", available: false, specialty: ["text"] },
  {
    label: "omni-moderation-latest",
    value: "omni-moderation-latest",
    available: false,
    specialty: ["text"],
  },
  { label: "o1-mini", value: "o1-mini", available: false, specialty: ["text"] },
  {
    label: "o1-preview",
    value: "o1-preview",
    available: false,
    specialty: ["text"],
  },

  // --- Omni ---
  {
    label: "gpt-4o",
    value: "gpt-4o",
    available: true,
    specialty: ["realtime"],
  },
  {
    label: "gpt-4o-audio-preview",
    value: "gpt-4o-audio-preview",
    available: false,
    specialty: ["tts"],
  },
  {
    label: "gpt-4o-mini",
    value: "gpt-4o-mini",
    available: true,
    specialty: ["text"],
  },
  {
    label: "gpt-4o-mini-audio-preview",
    value: "gpt-4o-mini-audio-preview",
    available: false,
    specialty: ["tts"],
  },
  {
    label: "gpt-4o-mini-realtime-preview",
    value: "gpt-4o-mini-realtime-preview",
    available: false,
    specialty: ["realtime"],
  },
  {
    label: "gpt-4o-realtime-preview",
    value: "gpt-4o-realtime-preview",
    available: false,
    specialty: ["realtime"],
  },

  // --- Turbo / Legacy ---
  {
    label: "gpt-4-turbo",
    value: "gpt-4-turbo",
    available: false,
    specialty: ["text"],
  },
  {
    label: "chatgpt-4o-latest",
    value: "chatgpt-4o-latest",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gpt-4-turbo-preview",
    value: "gpt-4-turbo-preview",
    available: false,
    specialty: ["text"],
  },

  // --- Transcription / TTS ---
  {
    label: "gpt-4o-mini-transcribe",
    value: "gpt-4o-mini-transcribe",
    available: false,
    specialty: ["stt"],
  },
  {
    label: "gpt-4o-mini-tts",
    value: "gpt-4o-mini-tts",
    available: false,
    specialty: ["tts"],
    voices: openAIVoices,
  },
  {
    label: "gpt-4o-transcribe",
    value: "gpt-4o-transcribe",
    available: false,
    specialty: ["stt"],
  },
  {
    label: "gpt-4o-transcribe-diarize",
    value: "gpt-4o-transcribe-diarize",
    available: false,
    specialty: ["stt"],
  },

  // --- Open Weights ---
  {
    label: "gpt-oss-120b",
    value: "gpt-oss-120b",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gpt-oss-20b",
    value: "gpt-oss-20b",
    available: false,
    specialty: ["text"],
  },

  // --- Embeddings & Moderation ---
  {
    label: "text-embedding-3-large",
    value: "text-embedding-3-large",
    available: false,
    specialty: ["text"],
  },
  {
    label: "text-embedding-3-small",
    value: "text-embedding-3-small",
    available: false,
    specialty: ["text"],
  },
  {
    label: "text-embedding-ada-002",
    value: "text-embedding-ada-002",
    available: false,
    specialty: ["text"],
  },
  {
    label: "text-moderation-latest",
    value: "text-moderation-latest",
    available: false,
    specialty: ["text"],
  },
  {
    label: "text-moderation-stable",
    value: "text-moderation-stable",
    available: false,
    specialty: ["text"],
  },

  // --- Legacy ---
  {
    label: "tts-1",
    value: "tts-1",
    available: false,
    specialty: ["tts"],
    voices: openAIVoices,
  },
  {
    label: "tts-1-hd",
    value: "tts-1-hd",
    available: false,
    specialty: ["tts"],
    voices: openAIVoices,
  },
  {
    label: "whisper-1",
    value: "whisper-1",
    available: false,
    specialty: ["stt"],
  },
  {
    label: "dall-e-3",
    value: "dall-e-3",
    available: false,
    specialty: ["image"],
  },
];

export const googleModelList: Model[] = [
  {
    label: "gemini-3-pro-preview",
    value: "gemini-3-pro-preview",
    available: false,
    specialty: ["text"],
    voices: googleVoices,
  },
  {
    label: "gemini-3-flash-preview",
    value: "gemini-3-flash-preview",
    available: false,
    specialty: ["realtime"],
  },
  {
    label: "gemini-3-pro-image-preview",
    value: "gemini-3-pro-image-preview",
    available: false,
    specialty: ["image"],
  },

  {
    label: "gemini-2.5-pro",
    value: "gemini-2.5-pro",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gemini-2.5-flash",
    value: "gemini-2.5-flash",
    available: true,
    specialty: ["realtime"],
  },
  {
    label: "gemini-2.5-flash-lite",
    value: "gemini-2.5-flash-lite",
    available: true,
    specialty: ["text"],
  },
  {
    label: "gemini-2.5-flash-image",
    value: "gemini-2.5-flash-image",
    available: false,
    specialty: ["image"],
  },

  {
    label: "gemini-2.5-pro-tts",
    value: "gemini-2.5-pro-tts",
    available: false,
    specialty: ["tts"],
    voices: googleVoices,
  },
  {
    label: "gemini-live-2.5-flash-native-audio",
    value: "gemini-live-2.5-flash-native-audio",
    available: false,
    specialty: ["realtime"],
    voices: googleVoices,
  },
  {
    label: "gemini-2.5-flash-preview-tts",
    value: "gemini-2.5-flash-preview-tts",
    available: false,
    specialty: ["tts"],
  },

  {
    label: "veo-3.1",
    value: "veo-3.1",
    available: false,
    specialty: ["video"],
  },
  {
    label: "gemini-robotics-er-1.5",
    value: "gemini-robotics-er-1.5",
    available: false,
    specialty: ["vision"],
  },

  {
    label: "gemini-2.0-flash-001",
    value: "gemini-2.0-flash-001",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gemini-2.0-flash-lite-001",
    value: "gemini-2.0-flash-lite-001",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gemini-1.5-pro-002",
    value: "gemini-1.5-pro-002",
    available: false,
    specialty: ["text"],
  },

  {
    label: "imagen-3.0-generate-002",
    value: "imagen-3.0-generate-002",
    available: false,
    specialty: ["image"],
  },
  {
    label: "imagen-3.0-fast-001",
    value: "imagen-3.0-fast-001",
    available: false,
    specialty: ["image"],
  },

  {
    label: "gemma-3-27b-it",
    value: "gemma-3-27b-it",
    available: false,
    specialty: ["text"],
  },
  {
    label: "gemma-2-9b",
    value: "gemma-2-9b",
    available: false,
    specialty: ["text"],
  },

  {
    label: "gemini-embedding-001",
    value: "gemini-embedding-001",
    available: false,
    specialty: ["text"],
  },
  {
    label: "text-embedding-005",
    value: "text-embedding-005",
    available: false,
    specialty: ["text"],
  },
];

export const openRouterModelList: Model[] = [
  {
    label: "anthropic/claude-4.5-sonnet",
    value: "anthropic/claude-4.5-sonnet",
    available: true,
    specialty: ["text"],
  },
  {
    label: "openai/gpt-5.2",
    value: "openai/gpt-5.2",
    available: false,
    specialty: ["text"],
  },
  {
    label: "google/gemini-3-pro-preview",
    value: "google/gemini-3-pro-preview",
    available: false,
    specialty: ["text"],
  },
  {
    label: "x-ai/grok-code-fast-1",
    value: "x-ai/grok-code-fast-1",
    available: true,
    specialty: ["text"],
  },

  {
    label: "deepseek/deepseek-v3.2-speciale",
    value: "deepseek/deepseek-v3.2-speciale",
    available: true,
    specialty: ["vision"],
  },
  {
    label: "qwen/qwen-3-vl-72b",
    value: "qwen/qwen-3-vl-72b",
    available: true,
    specialty: ["vision"],
  },
  {
    label: "nvidia/llama-3.3-nemotron-super-49b",
    value: "nvidia/llama-3.3-nemotron-super-49b",
    available: true,
    specialty: ["vision"],
  },
  {
    label: "xiaomi/mimo-v2-flash",
    value: "xiaomi/mimo-v2-flash",
    available: false,
    specialty: ["text"],
  },

  {
    label: "mistralai/devstral-2-2512",
    value: "mistralai/devstral-2-2512",
    available: false,
    specialty: ["text"],
  },
  {
    label: "kwaipilot/kat-coder-pro-v1",
    value: "kwaipilot/kat-coder-pro-v1",
    available: false,
    specialty: ["text"],
  },
  {
    label: "tngtech/deepseek-r1t2-chimera",
    value: "tngtech/deepseek-r1t2-chimera",
    available: true,
    specialty: ["text"],
  },

  {
    label: "openai/gpt-5-mini",
    value: "openai/gpt-5-mini",
    available: false,
    specialty: ["text"],
  },
  {
    label: "google/gemini-2.5-flash:nitro",
    value: "google/gemini-2.5-flash:nitro",
    available: false,
    specialty: ["realtime"],
  },
  {
    label: "anthropic/claude-4.5-haiku",
    value: "anthropic/claude-4.5-haiku",
    available: true,
    specialty: ["text"],
  },
  {
    label: "amazon/nova-micro-1.0",
    value: "amazon/nova-micro-1.0",
    available: false,
    specialty: ["text"],
  },

  {
    label: "black-forest-labs/flux-2-dev",
    value: "black-forest-labs/flux-2-dev",
    available: false,
    specialty: ["image"],
  },
  {
    label: "openai/sora-2",
    value: "openai/sora-2",
    available: false,
    specialty: ["video"],
  },
];

//caluude 4.5
export const modelProviders: Provider[] = [
  {
    value: "openai",
    label: "OpenAI",
    isEnabled: true,
    models: openAiModelList,
  },
  {
    value: "googlegemini",
    label: "Google Gemini",
    isEnabled: true,
    models: googleModelList,
  },

  {
    value: "openrouter",
    label: "OpenRouter",
    isEnabled: true,
    models: openRouterModelList,
  },
];

export type AITask =
  | "extraction"
  | "summarization"
  | "classification"
  | "sentimentAnalytics"
  | "questionAnswer"
  | "aiPersona";

export const TASK_SPECIALTY_MAP: Record<AITask, Model["specialty"][number][]> =
  {
    extraction: ["text"],
    summarization: ["text"],
    classification: ["text"],
    sentimentAnalytics: ["text"],
    questionAnswer: ["text", "deep-search"],
    aiPersona: ["text", "realtime"],
  };
