import { LLMProviderType } from "../types/llm-provider.type";

export const embeddingModelProviders: LLMProviderType[] = [
  {
    value: "openai",
    label: "OpenAI",
    models: [
      // TODO: Enable it when pgvector, qdrant supports 3072 dimension { value: "text-embedding-3-large",},
      {
        label: "text-embedding-3-small",
        value: "text-embedding-3-small",
        available: true,
      },
      {
        label: "text-embedding-ada-002",
        value: "text-embedding-ada-002",
        available: true,
      },
    ],
  },

  // TODO: Enable it when pgvector, qdrant supports 3072 dimension
  // {
  //   value: "googlegemini",
  //   label: "Google Gemini",
  //   models: [
  //     { value: "gemini-embedding-001" },
  //     { value: "gemini-embedding-2-preview" },
  //   ],
  // },

  // NOTE: Anthropic doesn't have embedding models as of now, we will add it when they release embedding models

  {
    value: "openrouter",
    label: "OpenRouter",
    models: [
      {
        value: "openai/text-embedding-3-small",
        label: "OpenAI: Text Embedding 3 Small",
        available: true,
      },
      {
        value: "openai/text-embedding-ada-002",
        label: "OpenAI: Text Embedding Ada 002",
        available: true,
      },
      // TODO: Enable it when pgvector, qdrant supports 384 dimension { value: "sentence-transformers/paraphrase-minilm-l6-v2", label: "Sentence Transformers: paraphrase-MiniLM-L6-v2", },
      // TODO: Enable it when pgvector, qdrant supports 384 dimension { value: "sentence-transformers/all-minilm-l12-v2", label: "Sentence Transformers: all-MiniLM-L12-v2", },
      // TODO: Enable it when pgvector, qdrant supports 768 dimension { value: "sentence-transformers/multi-qa-mpnet-base-dot-v1", label: "Sentence Transformers: multi-qa-mpnet-base-dot-v1", },
      // TODO: Enable it when pgvector, qdrant supports 768 dimension { value: "sentence-transformers/all-mpnet-base-v2", label: "Sentence Transformers: all-mpnet-base-v2", },
      // TODO: Enable it when pgvector, qdrant supports 384 dimension { value: "sentence-transformers/all-minilm-l6-v2", label: "Sentence Transformers: all-MiniLM-L6-v2", },
      // TODO: Enable it when pgvector, qdrant supports 3072 dimension { value: "openai/text-embedding-3-large", label: "OpenAI: Text Embedding 3 Large", },
      // TODO: Enable it when pgvector, qdrant supports 4096 dimension { value: "qwen/qwen3-embedding-8b", label: "Qwen: Qwen3 Embedding 8B" },
      // TODO: Enable it when pgvector, qdrant supports 2560 dimension { value: "qwen/qwen3-embedding-4b", label: "Qwen: Qwen3 Embedding 4B" },
      // TODO: Enable it when pgvector, qdrant supports 3072 dimension { value: "google/gemini-embedding-2-preview", label: "Google: Gemini Embedding 2 Preview", },
      // TODO: Enable it when pgvector, qdrant supports 3072 dimension { value: "google/gemini-embedding-001", label: "Google: Gemini Embedding 001",},
      // TODO: Enable it when pgvector, qdrant supports 2560 dimension { value: "perplexity/pplx-embed-v1-4b", label: "Perplexity: Embed V1 4B", },
      // TODO: Enable it when pgvector, qdrant supports 1024 dimension { value: "perplexity/pplx-embed-v1-0.6b", label: "Perplexity: Embed V1 0.6B", },
      // TODO: Enable it when pgvector, qdrant supports 2048 dimension { value: "nvidia/llama-nemotron-embed-vl-1b-v2:free", label: "NVIDIA: Llama Nemotron Embed VL 1B V2 (free)" },
      // TODO: Enable it when pgvector, qdrant supports 768 dimension { value: "thenlper/gte-base", label: "Thenlper: GTE-Base" },
      // TODO: Enable it when pgvector, qdrant supports 1024 dimension { value: "thenlper/gte-large", label: "Thenlper: GTE-Large" },
      // TODO: Enable it when pgvector, qdrant supports 1024 dimension { value: "intfloat/e5-large-v2", label: "Intfloat: E5-Large-v2" },
      // TODO: Enable it when pgvector, qdrant supports 768 dimension { value: "intfloat/e5-base-v2", label: "Intfloat: E5-Base-v2" },
      // TODO: Enable it when pgvector, qdrant supports 1024 dimension { value: "intfloat/multilingual-e5-large", label: "Intfloat: Multilingual-E5-Large", },
      // TODO: Enable it when pgvector, qdrant supports 768 dimension { value: "baai/bge-base-en-v1.5", label: "BAAI: bge-base-en-v1.5" },
      // TODO: Enable it when pgvector, qdrant supports 1024 dimension { value: "baai/bge-large-en-v1.5", label: "BAAI: bge-large-en-v1.5" },
      // TODO: Enable it when pgvector, qdrant supports 1024 dimension { value: "baai/bge-m3", label: "BAAI: bge-m3" },
      // Do not add this model: It returns 404 error { value: "qwen/qwen3-embedding-0.6b", label: "Qwen: Qwen3 Embedding 0.6B", },
      // Do not add this model: It returns empty embeddings only { value: "mistralai/mistral-embed-2312", label: "Mistral: Mistral Embed 2312", },
      // Do not add this model: It returns empty embeddings only { value: "mistralai/codestral-embed-2505", label: "Mistral: Codestral Embed 2505", },
    ],
  },
];

// NOTE: Embedding dimension selection guide
//
// Choose lower dimensions (384) when:
// - Running on edge/local devices with tight memory and latency limits.
// - Your search use case is broad semantic matching, not fine-grained ranking.
//
// Choose mid dimensions (768 to 1024) when:
// - You want the best cost/performance balance for production RAG systems.
// - Your corpus is mostly documentation, FAQs, product content, or tickets.
// - You need good quality while keeping Qdrant/pgvector storage and query costs stable.
//
// Choose higher dimensions (3072 to 4096) when:
// - Accuracy on highly similar content is a hard requirement.
// - You have benchmark evidence that lower dimensions miss critical distinctions.
// - Higher storage, indexing, and query costs are acceptable.
//
// Recommendation for our knowledge base feature:
// - Start with 1024 as the default "sweet spot".
// - Move higher only after evaluation shows meaningful recall/precision gains.
// - Expect diminishing returns: dimensions can grow ~3x while quality may improve only marginally.
