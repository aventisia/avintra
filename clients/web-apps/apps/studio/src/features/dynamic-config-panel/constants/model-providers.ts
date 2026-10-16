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
  specialty: ("text" | "vision" | "image" | "tts" | "stt" | "video" | "realtime" | "deep-search")[];
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

/** Curated OpenAI text-to-speech voice options. */
export const openAIVoices = [
  { label: "Alloy", value: "alloy" },
  { label: "Echo", value: "echo" },
  { label: "Fable", value: "fable" },
  { label: "Onyx", value: "onyx" },
  { label: "Nova", value: "nova" },
  { label: "Shimmer", value: "shimmer" },
];

export const openAiModelList: Model[] = [
  // --- GPT-5 Frontier Series (Released Aug-Dec 2025) ---
  {
    label: "gpt-5.2",
    value: "gpt-5.2",
    available: false,
    specialty: ["text", "vision"],
    voices: openAIVoices,
  },
  {
    label: "gpt-5.1",
    value: "gpt-5.1",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "gpt-5",
    value: "gpt-5",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "gpt-5-mini",
    value: "gpt-5-mini",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "gpt-5-nano",
    value: "gpt-5-nano",
    available: true,
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

  // --- Image Generation (GPT-Image replaces DALL-E) ---
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

  // --- Deep Research & Advanced Reasoning (o-series) ---
  {
    label: "o3-deep-research",
    value: "o3-deep-research",
    available: false,
    specialty: ["text", "deep-search"],
  },
  {
    label: "o4-mini-deep-research",
    value: "o4-mini-deep-research",
    available: false,
    specialty: ["text", "deep-search"],
  },
  {
    label: "o3-pro",
    value: "o3-pro",
    available: false,
    specialty: ["text", "vision"],
  },
  { label: "o3", value: "o3", available: false, specialty: ["text", "vision"] },
  {
    label: "o4-mini",
    value: "o4-mini",
    available: false,
    specialty: ["text", "vision"],
  },

  // --- Audio & Realtime ---
  {
    label: "gpt-audio",
    value: "gpt-audio",
    available: false,
    specialty: ["tts", "stt"],
    voices: openAIVoices,
  },
  {
    label: "gpt-realtime",
    value: "gpt-realtime",
    available: false,
    specialty: ["realtime", "tts", "stt"],
    voices: openAIVoices,
  },
  {
    label: "gpt-realtime-mini",
    value: "gpt-realtime-mini",
    available: false,
    specialty: ["realtime", "tts", "stt"],
    voices: openAIVoices,
  },
  {
    label: "gpt-audio-mini",
    value: "gpt-audio-mini",
    available: false,
    specialty: ["tts", "stt"],
    voices: openAIVoices,
  },

  // --- GPT-4.1 Architecture (Non-Reasoning Optimization) ---
  {
    label: "gpt-4.1",
    value: "gpt-4.1",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "gpt-4.1-mini",
    value: "gpt-4.1-mini",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "gpt-4.1-nano",
    value: "gpt-4.1-nano",
    available: false,
    specialty: ["text"],
  },

  // --- Special Purpose & Preview Models ---
  {
    label: "o1-pro",
    value: "o1-pro",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "computer-use-preview",
    value: "computer-use-preview",
    available: false,
    specialty: ["vision", "text"],
  },
  {
    label: "gpt-4o-mini-search-preview",
    value: "gpt-4o-mini-search-preview",
    available: false,
    specialty: ["text", "deep-search"],
  },
  {
    label: "gpt-4o-search-preview",
    value: "gpt-4o-search-preview",
    available: false,
    specialty: ["text", "deep-search"],
  },
  {
    label: "gpt-4.5-preview",
    value: "gpt-4.5-preview",
    available: false,
    specialty: ["text"],
  }, // Deprecated July 2025
  {
    label: "o3-mini",
    value: "o3-mini",
    available: false,
    specialty: ["text", "vision"],
  },
  { label: "o1", value: "o1", available: false, specialty: ["text", "vision"] },
  {
    label: "omni-moderation-latest",
    value: "omni-moderation-latest",
    available: false,
    specialty: ["text"],
  },
  { label: "o1-mini", value: "o1-mini", available: false, specialty: ["text"] }, // Replaced by o4-mini
  {
    label: "o1-preview",
    value: "o1-preview",
    available: false,
    specialty: ["text"],
  }, // Replaced by o3

  // --- Omni Series ---
  {
    label: "gpt-4o",
    value: "gpt-4o",
    available: false,
    specialty: ["text", "vision", "realtime"],
  },
  {
    label: "gpt-4o-audio-preview",
    value: "gpt-4o-audio-preview",
    available: false,
    specialty: ["tts", "stt"],
  }, // Succeeded by gpt-audio
  {
    label: "gpt-4o-mini",
    value: "gpt-4o-mini",
    available: true,
    specialty: ["text", "vision"],
  },
  {
    label: "gpt-4o-mini-audio-preview",
    value: "gpt-4o-mini-audio-preview",
    available: false,
    specialty: ["tts", "stt"],
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

  // --- Turbo & Legacy Legacy ---
  {
    label: "gpt-4-turbo",
    value: "gpt-4-turbo",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "chatgpt-4o-latest",
    value: "chatgpt-4o-latest",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "gpt-4-turbo-preview",
    value: "gpt-4-turbo-preview",
    available: false,
    specialty: ["text"],
  },

  // --- Audio Specialized Transcribe/TTS ---
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

  // --- ChatGPT Product Variants ---
  {
    label: "gpt-5.2-chat-latest",
    value: "gpt-5.2-chat-latest",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "gpt-5.1-chat-latest",
    value: "gpt-5.1-chat-latest",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "gpt-5-chat-latest",
    value: "gpt-5-chat-latest",
    available: false,
    specialty: ["text", "vision"],
  },

  // --- Open Weights (GPT-OSS) ---
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

  // --- Legacy Audio/Image ---
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

// Official Google Gemini Live / TTS Voices (2025)
/** Curated Google Gemini text-to-speech voice options. */
export const googleVoices = [
  { label: "Journey", value: "journey" },
  { label: "Horizon", value: "horizon" },
  { label: "Lyra", value: "lyra" },
  { label: "Charon", value: "charon" },
  { label: "Kore", value: "kore" },
  { label: "Puck", value: "puck" },
  { label: "Fenrir", value: "fenrir" },
];

export const googleModelList: Model[] = [
  // --- Gemini 3 Frontier Series (Released Nov-Dec 2025) ---
  {
    label: "Gemini 3 Pro",
    value: "gemini-3-pro-preview",
    available: false,
    specialty: ["text", "vision", "deep-search"],
    voices: googleVoices,
  },
  {
    label: "Gemini 3 Flash",
    value: "gemini-3-flash-preview",
    available: false,
    specialty: ["text", "vision", "realtime"],
  },
  {
    label: "Gemini 3.1 Flash-Lite",
    value: "gemini-3.1-flash-lite",
    available: true,
    specialty: ["text", "vision"],
  },
  {
    label: "Gemini 3 Pro Image (Nano Banana Pro)",
    value: "gemini-3-pro-image-preview",
    available: false,
    specialty: ["image"],
  },

  // --- Gemini 2.5 Stable Series ---
  {
    label: "Gemini 2.5 Pro",
    value: "gemini-2.5-pro",
    available: false,
    specialty: ["text", "vision", "deep-search"],
  },
  {
    label: "Gemini 2.5 Flash",
    value: "gemini-2.5-flash",
    available: true,
    specialty: ["text", "vision", "realtime"],
  },
  {
    label: "Gemini 2.5 Flash-Lite",
    value: "gemini-2.5-flash-lite",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "Gemini 2.5 Flash Image",
    value: "gemini-2.5-flash-image",
    available: false,
    specialty: ["image"],
  },

  // --- Audio & Voice Specialized ---
  {
    label: "Gemini 2.5 Pro TTS",
    value: "gemini-2.5-pro-tts",
    available: false,
    specialty: ["tts"],
    voices: googleVoices,
  },
  {
    label: "Gemini Live 2.5 Flash (Audio)",
    value: "gemini-live-2.5-flash-native-audio",
    available: false,
    specialty: ["realtime", "tts", "stt"],
    voices: googleVoices,
  },
  {
    label: "Gemini 2.5 Flash TTS Preview",
    value: "gemini-2.5-flash-preview-tts",
    available: false,
    specialty: ["tts"],
  },

  // --- Video & Robotics ---
  {
    label: "Veo 3.1",
    value: "veo-3.1",
    available: false,
    specialty: ["video"],
  },
  {
    label: "Gemini Robotics-ER 1.5",
    value: "gemini-robotics-er-1.5",
    available: false,
    specialty: ["vision", "text"],
  },

  // --- Legacy & Retired (Available for 2025 Migration) ---
  {
    label: "Gemini 2.0 Flash",
    value: "gemini-2.0-flash-001",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "Gemini 2.0 Flash-Lite",
    value: "gemini-2.0-flash-lite-001",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "Gemini 1.5 Pro (Legacy)",
    value: "gemini-1.5-pro-002",
    available: false, // Retired Sep 2025
    specialty: ["text", "vision"],
  },

  // --- Image Generation (Imagen Series) ---
  {
    label: "Imagen 3.0 Generate",
    value: "imagen-3.0-generate-002",
    available: false,
    specialty: ["image"],
  },
  {
    label: "Imagen 3.0 Fast",
    value: "imagen-3.0-fast-001",
    available: false,
    specialty: ["image"],
  },

  // --- Open Models (Gemma) ---
  {
    label: "Gemma 3 27B IT",
    value: "gemma-3-27b-it",
    available: false,
    specialty: ["text", "image"],
  },
  {
    label: "Gemma 2 9B",
    value: "gemma-2-9b",
    available: false,
    specialty: ["text"],
  },

  // --- Embeddings ---
  {
    label: "Gemini Embedding 001",
    value: "gemini-embedding-001",
    available: false,
    specialty: ["text"],
  },
  {
    label: "Text Embedding 005",
    value: "text-embedding-005",
    available: false,
    specialty: ["text"],
  },
];

export const openRouterModelList: Model[] = [
  // --- Trending Reasoning & Frontier Models ---
  {
    label: "anthropic/claude-4.5-sonnet-20250929",
    value: "anthropic/claude-4.5-sonnet-20250929",
    available: false,
    specialty: ["text", "vision", "deep-search"],
  },
  {
    label: "GPT-5.2 (OpenAI)",
    value: "openai/gpt-5.2",
    available: false,
    specialty: ["text", "vision", "realtime"],
  },
  {
    label: "Gemini 3 Pro Preview",
    value: "google/gemini-3-pro-preview",
    available: false,
    specialty: ["text", "vision", "deep-search"],
  },
  {
    label: "x-ai/grok-3-mini",
    value: "x-ai/grok-3-mini",
    available: false,
    specialty: ["text", "deep-search"],
  },

  // --- High-Performance Open Weights ---
  {
    label: "deepseek/deepseek-v3.2-speciale-20251201",
    value: "deepseek/deepseek-v3.2-speciale-20251201",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "qwen/qwen3-vl-32b-instruct",
    value: "qwen/qwen3-vl-32b-instruct",
    available: false,
    specialty: ["vision", "text"],
  },
  {
    label: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    value: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "MiMo-V2-Flash (Xiaomi)",
    value: "xiaomi/mimo-v2-flash",
    available: false,
    specialty: ["text", "deep-search"],
  },

  // --- Specialized & Agentic Models ---
  {
    label: "Devstral 2 (Mistral Coding)",
    value: "mistralai/devstral-2-2512",
    available: false,
    specialty: ["text"],
  },
  {
    label: "KAT-Coder-Pro V1",
    value: "kwaipilot/kat-coder-pro-v1",
    available: false,
    specialty: ["text"],
  },
  {
    label: "tngtech/deepseek-r1t2-chimera",
    value: "tngtech/deepseek-r1t2-chimera",
    available: false,
    specialty: ["text"],
  },

  // --- Efficient / High-Throughput (Nitro) ---
  {
    label: "GPT-5 Mini",
    value: "openai/gpt-5-mini",
    available: false,
    specialty: ["text", "vision"],
  },
  {
    label: "Gemini 2.5 Flash (Nitro)",
    value: "google/gemini-2.5-flash:nitro",
    available: false,
    specialty: ["text", "vision", "realtime"],
  },
  {
    label: "anthropic/claude-4.5-haiku-20251001",
    value: "anthropic/claude-4.5-haiku-20251001",
    available: false,
    specialty: ["text", "realtime"],
  },
  {
    label: "Nova Micro 1.0 (Amazon)",
    value: "amazon/nova-micro-1.0",
    available: false,
    specialty: ["text"],
  },

  // --- Image & Video ---
  {
    label: "Flux 2 Dev (Z-Image)",
    value: "black-forest-labs/flux-2-dev",
    available: false,
    specialty: ["image"],
  },
  {
    label: "Sora 2 (API Access)",
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
    label: "Google",
    isEnabled: true,
    models: googleModelList,
  },
  {
    value: "anthropic",
    label: "Anthropic",
    isEnabled: false,
    models: [],
  },
  {
    value: "openrouter",
    label: "OpenRouter",
    isEnabled: false,
    models: openRouterModelList,
  },
  {
    value: "ollama",
    label: "Ollama On-prem",
    isEnabled: false,
    models: [],
  },
  {
    value: "ollamacloud",
    label: "Ollama Cloud",
    isEnabled: false,
    models: [],
  },
  {
    value: "groq",
    label: "Groq",
    isEnabled: false,
    models: [],
  },
  {
    value: "mistral",
    label: "Mistral",
    isEnabled: false,
    models: [],
  },
];

/**
 * UI Node Names in PascalCase.
 * Maps to the underlying schema 'specialty' types.
 */
export const NODE_REGISTRY = {
  Vision: "vision",
  Inferencing: "text",
  Conversation: "text",
  SpeechToText: "stt",
  TextToSpeech: "tts",
  Image: "image",
  Video: "video",
  DeepResearch: "deep-search",
} as const;

export type UINodeName = keyof typeof NODE_REGISTRY;
export type Specialty = (typeof NODE_REGISTRY)[UINodeName];

/**
 * Safely retrieves the specialty for a given node name.
 * @param nodeName - The PascalCase name of the node (e.g., 'Vision')
 * @returns The specialty key, falling back to 'text' if not found.
 */
export const getSpecialtyFromNode = (nodeName: string): Model["specialty"] => {
  // Check if the provided string is a valid key in our registry
  if (nodeName in NODE_REGISTRY) {
    return [NODE_REGISTRY[nodeName as UINodeName]];
  }

  // Default fallback to 'text' specialty
  return ["text"];
};
