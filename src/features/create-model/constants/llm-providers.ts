export type Model = {
  value: string;
  label: string;
  available: boolean;
};

export type Provider = {
  value: string;
  label: string;
  models: Model[];
};

//Mark available for the models that are provided on the platform
export const providersData: Provider[] = [
  {
    value: "openai",
    label: "OpenAI",
    models: [
      { value: "gpt-4.1", label: "GPT-4.1", available: false },
      { value: "gpt-4o", label: "GPT-4o", available: true },
      { value: "gpt-4o-mini", label: "GPT-4o Mini", available: true },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo", available: false },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", available: false },
    ],
  },
  {
    value: "anthropic",
    label: "Anthropic",
    models: [
      {
        value: "claude-3.5-sonnet",
        label: "Claude 3.5 Sonnet",
        available: true,
      },
      { value: "claude-3-haiku", label: "Claude 3 Haiku", available: false },
      { value: "claude-3-opus", label: "Claude 3 Opus", available: false },
    ],
  },
  {
    value: "google",
    label: "Google (Gemini)",
    models: [
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", available: true },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", available: false },
      { value: "gemini-ultra", label: "Gemini Ultra", available: false },
    ],
  },
  {
    value: "meta",
    label: "Meta (Llama)",
    models: [
      { value: "llama-3-70b", label: "Llama 3 70B", available: true },
      { value: "llama-3-8b", label: "Llama 3 8B", available: true },
      { value: "llama-2-70b", label: "Llama 2 70B", available: false },
    ],
  },
  {
    value: "mistral",
    label: "Mistral AI",
    models: [
      { value: "mistral-large", label: "Mistral Large", available: true },
      { value: "mixtral-8x7b", label: "Mixtral 8x7B", available: true },
      { value: "mistral-medium", label: "Mistral Medium", available: false },
    ],
  },
  {
    value: "cohere",
    label: "Cohere",
    models: [
      { value: "command-r", label: "Command-R", available: false },
      { value: "command-r-plus", label: "Command-R+", available: false },
      { value: "command", label: "Command", available: false },
    ],
  },
  {
    value: "perplexity",
    label: "Perplexity",
    models: [
      {
        value: "pplx-70b-online",
        label: "PPLX 70B (Online)",
        available: false,
      },
      { value: "pplx-7b-online", label: "PPLX 7B (Online)", available: false },
    ],
  },
  {
    value: "groq",
    label: "Groq",
    models: [
      {
        value: "llama3-70b-groq",
        label: "Llama 3 70B (Groq)",
        available: false,
      },
      { value: "mixtral-groq", label: "Mixtral (Groq)", available: false },
    ],
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    models: [
      { value: "deepseek-v2", label: "DeepSeek V2", available: true },
      { value: "deepseek-coder", label: "DeepSeek Coder", available: false },
    ],
  },
  {
    value: "qwen",
    label: "Alibaba Qwen",
    models: [
      { value: "qwen-2.5-72b", label: "Qwen 2.5 72B", available: false },
      { value: "qwen-2.5-32b", label: "Qwen 2.5 32B", available: false },
    ],
  },
];
