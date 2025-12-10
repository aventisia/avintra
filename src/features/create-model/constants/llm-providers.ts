export type Model = {
  value: string;
  label: string;
  available: boolean;
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
  value: string;
  label: string;
  models: Model[];
  isEnabled?: boolean;
};

// Mark available for the models that are provided on the platform
export const providersData: Provider[] = [
  // OpenAI
  {
    value: "openai",
    label: "OpenAI",
    isEnabled: true,
    models: [
      {
        value: "gpt-4.1",
        label: "GPT-4.1",
        available: true,
        specialty: "text",
      },
      {
        value: "gpt-realtime",
        label: "GPT Realtime",
        available: true,
        specialty: "realtime",
      },
      {
        value: "gpt-4o-mini",
        label: "GPT-4o Mini",
        available: true,
        specialty: "text",
      },
      {
        value: "gpt-4o-vision",
        label: "GPT-4o Vision",
        available: true,
        specialty: "vision",
      },
      {
        value: "gpt-3.5-turbo",
        label: "GPT-3.5 Turbo",
        available: true,
        specialty: "text",
      },
      {
        value: "dall-e-3",
        label: "DALL·E 3",
        available: true,
        specialty: "image",
      },
      {
        value: "whisper-1",
        label: "Whisper",
        available: true,
        specialty: "stt",
      },
      {
        value: "openai-tts",
        label: "OpenAI TTS",
        available: true,
        specialty: "tts",
      },
    ],
  },

  // Anthropic
  {
    value: "anthropic",
    label: "Anthropic",
    isEnabled: true,
    models: [
      {
        value: "claude-3-opus",
        label: "Claude 3 Opus",
        available: true,
        specialty: "text",
      },
      {
        value: "claude-3-sonnet",
        label: "Claude 3 Sonnet",
        available: true,
        specialty: "text",
      },
      {
        value: "claude-3-haiku",
        label: "Claude 3 Haiku",
        available: true,
        specialty: "text",
      },
    ],
  },

  // Google
  {
    value: "googleGemini",
    label: "Google Gemini",
    isEnabled: true,
    models: [
      {
        value: "gemini-1.5-pro",
        label: "Gemini 1.5 Pro",
        available: false,
        specialty: "text",
      },
      {
        value: "gemini-1.5-flash",
        label: "Gemini 1.5 Flash",
        available: true,
        specialty: "text",
      },
      {
        value: "gemini-vision",
        label: "Gemini Vision",
        available: true,
        specialty: "vision",
      },
      {
        value: "gemini-tts",
        label: "Gemini TTS",
        available: true,
        specialty: "tts",
      },
      {
        value: "gemini-stt",
        label: "Gemini Speech-to-Text",
        available: true,
        specialty: "stt",
      },
    ],
  },

  // Deep Infra
  {
    label: "Deep Infra",
    value: "deepinfra",
    isEnabled: true,
    models: [],
  },

  // ElevenLabs (Voice)
  {
    value: "elevenlabs",
    label: "ElevenLabs",
    isEnabled: true,
    models: [
      {
        value: "eleven-multilingual-v2",
        label: "Multilingual v2",
        available: true,
        specialty: "tts",
      },
      {
        value: "eleven-voice-clone",
        label: "Voice Cloning",
        available: true,
        specialty: "tts",
      },
    ],
  },

  // Meta (Open Source)
  {
    value: "meta",
    label: "Meta",
    isEnabled: false,
    models: [
      {
        value: "llama-3-70b",
        label: "LLaMA 3 70B",
        available: true,
        specialty: "text",
      },
      {
        value: "llama-3-8b",
        label: "LLaMA 3 8B",
        available: true,
        specialty: "text",
      },
      {
        value: "llama-2-70b",
        label: "LLaMA 2 70B",
        available: false,
        specialty: "text",
      },
    ],
  },

  // Mistral
  {
    value: "mistral",
    label: "Mistral",
    isEnabled: false,
    models: [
      {
        value: "mistral-large",
        label: "Mistral Large",
        available: true,
        specialty: "text",
      },
      {
        value: "mistral-medium",
        label: "Mistral Medium",
        available: true,
        specialty: "text",
      },
      {
        value: "mixtral-8x7b",
        label: "Mixtral 8×7B",
        available: true,
        specialty: "text",
      },
      {
        value: "mixtral-8x22b",
        label: "Mixtral 8×22B",
        available: true,
        specialty: "text",
      },
    ],
  },

  // Cohere
  {
    value: "cohere",
    label: "Cohere",
    isEnabled: false,
    models: [
      {
        value: "command-r",
        label: "Command-R",
        available: true,
        specialty: "deep-search",
      },
      {
        value: "command-r-plus",
        label: "Command-R+",
        available: true,
        specialty: "text",
      },
      {
        value: "embed-english",
        label: "Embed English",
        available: true,
        specialty: "text",
      },
    ],
  },

  // Perplexity
  {
    value: "perplexity",
    label: "Perplexity",
    isEnabled: false,
    models: [
      {
        value: "pplx-online",
        label: "Online Search",
        available: true,
        specialty: "deep-search",
      },
      {
        value: "pplx-70b",
        label: "Perplexity 70B",
        available: true,
        specialty: "text",
      },
    ],
  },

  // DeepSeek
  {
    value: "deepseek",
    label: "DeepSeek",
    isEnabled: false,
    models: [
      {
        value: "deepseek-chat",
        label: "DeepSeek Chat",
        available: true,
        specialty: "text",
      },
      {
        value: "deepseek-coder",
        label: "DeepSeek Coder",
        available: true,
        specialty: "text",
      },
    ],
  },

  // Groq (Fast inference)
  {
    value: "groq",
    label: "Groq",
    isEnabled: false,
    models: [
      {
        value: "llama-3-70b-groq",
        label: "LLaMA 3 70B (Groq)",
        available: true,
        specialty: "text",
      },
      {
        value: "mixtral-groq",
        label: "Mixtral (Groq)",
        available: true,
        specialty: "text",
      },
    ],
  },

  // Stability AI
  {
    value: "stability",
    label: "Stability AI",
    isEnabled: false,
    models: [
      {
        value: "sdxl",
        label: "Stable Diffusion XL",
        available: true,
        specialty: "image",
      },
      {
        value: "sd-turbo",
        label: "Stable Diffusion Turbo",
        available: true,
        specialty: "image",
      },
    ],
  },

  // Runway (Video)
  {
    value: "runway",
    label: "Runway",
    isEnabled: false,
    models: [
      {
        value: "gen-2",
        label: "Gen-2 Video",
        available: true,
        specialty: "video",
      },
      {
        value: "gen-3",
        label: "Gen-3 Video",
        available: true,
        specialty: "video",
      },
    ],
  },

  // Pika Labs (Video)
  {
    value: "pika",
    label: "Pika Labs",
    isEnabled: false,
    models: [
      {
        value: "pika-1.0",
        label: "Pika 1.0",
        available: true,
        specialty: "video",
      },
    ],
  },

  // AssemblyAI (Speech)
  {
    value: "assemblyai",
    label: "AssemblyAI",
    isEnabled: false,
    models: [
      {
        value: "assembly-stt",
        label: "Speech-to-Text",
        available: true,
        specialty: "stt",
      },
    ],
  },
];
