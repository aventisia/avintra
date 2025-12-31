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
  specialty:
    | "text"
    | "vision"
    | "image"
    | "tts"
    | "stt"
    | "video"
    | "realtime"
    | "deep-search";
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
export const modelProviders: Provider[] = [
  {
    value: "openai",
    label: "OpenAI",
    isEnabled: true,
    models: [
      /* ================= TEXT ================= */
      {
        value: "gpt-5.2",
        label: "GPT-5.2",
        available: true,
        specialty: "text",
      },
      {
        value: "gpt-5.2-pro",
        label: "GPT-5.2 Pro",
        available: true,
        specialty: "text",
      },

      {
        value: "gpt-5.1",
        label: "GPT-5.1",
        available: true,
        specialty: "text",
      },
      { value: "gpt-5", label: "GPT-5", available: true, specialty: "text" },

      {
        value: "gpt-5-mini",
        label: "GPT-5 Mini",
        available: true,
        specialty: "text",
      },
      {
        value: "gpt-5-nano",
        label: "GPT-5 Nano",
        available: true,
        specialty: "text",
      },

      {
        value: "gpt-5-pro",
        label: "GPT-5 Pro",
        available: true,
        specialty: "text",
      },

      {
        value: "gpt-5.1-codex",
        label: "GPT-5.1 Codex",
        available: true,
        specialty: "text",
      },
      {
        value: "gpt-5.1-codex-max",
        label: "GPT-5.1 Codex Max",
        available: true,
        specialty: "text",
      },
      {
        value: "gpt-5.1-codex-mini",
        label: "GPT-5.1 Codex Mini",
        available: true,
        specialty: "text",
      },
      {
        value: "gpt-5-codex",
        label: "GPT-5 Codex",
        available: true,
        specialty: "text",
      },

      { value: "o3", label: "o3", available: true, specialty: "text" },
      { value: "o3-pro", label: "o3 Pro", available: true, specialty: "text" },
      {
        value: "o3-mini",
        label: "o3 Mini",
        available: true,
        specialty: "text",
      },

      {
        value: "o4-mini",
        label: "o4 Mini",
        available: true,
        specialty: "text",
      },

      { value: "o1", label: "o1", available: true, specialty: "text" },
      { value: "o1-pro", label: "o1 Pro", available: true, specialty: "text" },

      /* ================= DEEP SEARCH ================= */
      {
        value: "o3-deep-research",
        label: "o3 Deep Research",
        available: true,
        specialty: "deep-search",
      },
      {
        value: "o4-mini-deep-research",
        label: "o4 Mini Deep Research",
        available: true,
        specialty: "deep-search",
      },

      /* ================= VISION / OCR ================= */
      {
        value: "gpt-4o",
        label: "GPT-4o",
        available: true,
        specialty: "vision",
      },
      {
        value: "gpt-4o-mini",
        label: "GPT-4o Mini",
        available: true,
        specialty: "text",
      },

      {
        value: "gpt-4.1",
        label: "GPT-4.1",
        available: true,
        specialty: "vision",
      },
      {
        value: "gpt-4.1-mini",
        label: "GPT-4.1 Mini",
        available: true,
        specialty: "vision",
      },
      {
        value: "gpt-4.1-nano",
        label: "GPT-4.1 Nano",
        available: true,
        specialty: "vision",
      },

      /* ================= IMAGE ================= */
      {
        value: "gpt-image-1.5",
        label: "GPT Image 1.5",
        available: true,
        specialty: "image",
      },
      {
        value: "gpt-image-1",
        label: "GPT Image 1",
        available: true,
        specialty: "image",
      },
      {
        value: "gpt-image-1-mini",
        label: "GPT Image 1 Mini",
        available: true,
        specialty: "image",
      },
      {
        value: "chatgpt-image-latest",
        label: "ChatGPT Image (Latest)",
        available: true,
        specialty: "image",
      },

      /* ================= VIDEO ================= */
      { value: "sora-2", label: "Sora 2", available: true, specialty: "video" },
      {
        value: "sora-2-pro",
        label: "Sora 2 Pro",
        available: true,
        specialty: "video",
      },

      /* ================= REALTIME ================= */
      {
        value: "gpt-realtime",
        label: "GPT Realtime",
        available: true,
        specialty: "realtime",
      },
      {
        value: "gpt-realtime-mini",
        label: "GPT Realtime Mini",
        available: true,
        specialty: "realtime",
      },
      {
        value: "gpt-4o-realtime-preview",
        label: "GPT-4o Realtime",
        available: true,
        specialty: "realtime",
      },
      {
        value: "gpt-4o-mini-realtime-preview",
        label: "GPT-4o Mini Realtime",
        available: true,
        specialty: "realtime",
      },

      /* ================= AUDIO (MULTIMODAL) ================= */
      {
        value: "gpt-audio",
        label: "GPT Audio",
        available: true,
        specialty: "realtime",
      },
      {
        value: "gpt-audio-mini",
        label: "GPT Audio Mini",
        available: true,
        specialty: "realtime",
      },
      {
        value: "gpt-4o-audio-preview",
        label: "GPT-4o Audio",
        available: true,
        specialty: "realtime",
      },
      {
        value: "gpt-4o-mini-audio-preview",
        label: "GPT-4o Mini Audio",
        available: true,
        specialty: "realtime",
      },

      /* ================= SPEECH → TEXT ================= */
      {
        value: "whisper-1",
        label: "Whisper",
        available: true,
        specialty: "stt",
      },
      {
        value: "gpt-4o-transcribe",
        label: "GPT-4o Transcribe",
        available: true,
        specialty: "stt",
      },
      {
        value: "gpt-4o-mini-transcribe",
        label: "GPT-4o Mini Transcribe",
        available: true,
        specialty: "stt",
      },
      {
        value: "gpt-4o-transcribe-diarize",
        label: "GPT-4o Transcribe Diarize",
        available: true,
        specialty: "stt",
      },

      /* ================= TEXT → SPEECH (VOICES) ================= */
      {
        value: "tts-1",
        label: "TTS-1",
        available: true,
        specialty: "tts",
        voices: [
          { label: "Alloy", value: "alloy" },
          { label: "Echo", value: "echo" },
          { label: "Fable", value: "fable" },
          { label: "Nova", value: "nova" },
          { label: "Onyx", value: "onyx" },
          { label: "Shimmer", value: "shimmer" },
        ],
      },
      {
        value: "tts-1-hd",
        label: "TTS-1 HD",
        available: true,
        specialty: "tts",
        voices: [
          { label: "Alloy", value: "alloy" },
          { label: "Echo", value: "echo" },
          { label: "Fable", value: "fable" },
          { label: "Nova", value: "nova" },
          { label: "Onyx", value: "onyx" },
          { label: "Shimmer", value: "shimmer" },
        ],
      },
      {
        value: "gpt-4o-mini-tts",
        label: "GPT-4o Mini TTS",
        available: true,
        specialty: "tts",
        voices: [
          { label: "Alloy", value: "alloy" },
          { label: "Echo", value: "echo" },
          { label: "Fable", value: "fable" },
          { label: "Nova", value: "nova" },
          { label: "Onyx", value: "onyx" },
          { label: "Shimmer", value: "shimmer" },
        ],
      },

      /* ================= EMBEDDINGS ================= */
      {
        value: "text-embedding-3-large",
        label: "Text Embedding 3 Large",
        available: true,
        specialty: "text",
      },
      {
        value: "text-embedding-3-small",
        label: "Text Embedding 3 Small",
        available: true,
        specialty: "text",
      },

      /* ================= OPEN WEIGHT ================= */
      {
        value: "gpt-oss-120b",
        label: "GPT-OSS-120B",
        available: true,
        specialty: "text",
      },
      {
        value: "gpt-oss-20b",
        label: "GPT-OSS-20B",
        available: true,
        specialty: "text",
      },

      /* ================= TOOLS ================= */
      {
        value: "computer-use-preview",
        label: "Computer Use Preview",
        available: true,
        specialty: "text",
      },
    ],
  },
  {
    value: "google",
    label: "Google Gemini",
    isEnabled: true,
    models: [
      /* ================= TEXT ================= */
      {
        value: "gemini-2.5-pro",
        label: "Gemini 2.5 Pro",
        available: true,
        specialty: "text",
      },
      {
        value: "gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        available: true,
        specialty: "text",
      },

      {
        value: "gemini-2.0-pro",
        label: "Gemini 2.0 Pro",
        available: true,
        specialty: "text",
      },
      {
        value: "gemini-2.0-flash",
        label: "Gemini 2.0 Flash",
        available: true,
        specialty: "text",
      },

      {
        value: "gemini-1.5-pro",
        label: "Gemini 1.5 Pro",
        available: true,
        specialty: "text",
      },
      {
        value: "gemini-1.5-flash",
        label: "Gemini 1.5 Flash",
        available: true,
        specialty: "text",
      },

      /* ================= VISION / OCR ================= */
      {
        value: "gemini-pro-vision",
        label: "Gemini Pro Vision",
        available: true,
        specialty: "vision",
      },

      /* ================= IMAGE / AUDIO / VIDEO ================= */
      // ❌ Gemini image/audio/video generation is API-feature based, not separate model IDs
    ],
  },

  {
    value: "deepinfra",
    label: "Deep Infra",
    isEnabled: true,
    models: [
      /* ================= META LLAMA ================= */
      {
        value: "meta-llama/Llama-3-8B-Instruct",
        label: "Llama 3 8B Instruct",
        available: true,
        specialty: "text",
      },
      {
        value: "meta-llama/Llama-3-70B-Instruct",
        label: "Llama 3 70B Instruct",
        available: true,
        specialty: "text",
      },

      {
        value: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
        label: "Llama 4 Scout",
        available: true,
        specialty: "vision",
      },
      {
        value: "meta-llama/Llama-4-Maverick-17B-128E-Instruct",
        label: "Llama 4 Maverick",
        available: true,
        specialty: "vision",
      },

      /* ================= MISTRAL ================= */
      {
        value: "mistralai/Mistral-7B-Instruct-v0.3",
        label: "Mistral 7B Instruct",
        available: true,
        specialty: "text",
      },
      {
        value: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        label: "Mixtral 8x7B",
        available: true,
        specialty: "text",
      },
      {
        value: "mistralai/Mixtral-8x22B-Instruct-v0.1",
        label: "Mixtral 8x22B",
        available: true,
        specialty: "text",
      },

      /* ================= DEEPSEEK ================= */
      {
        value: "deepseek-ai/DeepSeek-V3",
        label: "DeepSeek V3",
        available: true,
        specialty: "text",
      },
      {
        value: "deepseek-ai/DeepSeek-Coder-V2",
        label: "DeepSeek Coder V2",
        available: true,
        specialty: "text",
      },

      /* ================= QWEN ================= */
      {
        value: "qwen/Qwen2.5-7B-Instruct",
        label: "Qwen 2.5 7B",
        available: true,
        specialty: "text",
      },
      {
        value: "qwen/Qwen2.5-72B-Instruct",
        label: "Qwen 2.5 72B",
        available: true,
        specialty: "text",
      },

      /* ================= GOOGLE GEMMA ================= */
      {
        value: "google/gemma-2-9b-it",
        label: "Gemma 2 9B IT",
        available: true,
        specialty: "text",
      },
      {
        value: "google/gemma-2-27b-it",
        label: "Gemma 2 27B IT",
        available: true,
        specialty: "text",
      },

      /* ================= NVIDIA ================= */
      {
        value: "nvidia/Nemotron-3-Nano-30B-A3B",
        label: "Nemotron 3 Nano",
        available: true,
        specialty: "text",
      },

      /* ================= SPEECH (STT) ================= */
      {
        value: "openai/whisper-large-v3",
        label: "Whisper Large v3",
        available: true,
        specialty: "stt",
      },
      {
        value: "mistralai/Voxtral-Small-24B",
        label: "Voxtral Small",
        available: true,
        specialty: "stt",
      },

      /* ================= IMAGE / VIDEO / REALTIME ================= */
      // ❌ DeepInfra currently does NOT expose stable video or realtime models
    ],
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
    return NODE_REGISTRY[nodeName as UINodeName];
  }

  // Default fallback to 'text' specialty
  return "text";
};
