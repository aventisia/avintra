namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing the supported types of external providers for syncing models.
/// </summary>
public enum LLMProviderTypesEnum
{
    [Description("OpenRouter provider")]
    OpenRouter,
    [Description("Gemini provider")]
    Gemini,
    [Description("OpenAI provider")]
    OpenAI,
    [Description("Anthropic provider")]
    Anthropic,
    [Description("ElevenLabs provider")]
    ElevenLabs,
    [Description("Ollama provider")]
    Ollama,
    [Description("Ollama Cloud provider")]
    OllamaCloud,
    [Description("Groq provider")]
    Groq,
    [Description("Bedrock provider")]
    Bedrock,
    [Description("Mistral provider")]
    Mistral,

    // --- Individual LiteLLM provider types (generated) ---
    [Description("a2a provider")]
    A2a,
    [Description("a2a_agent provider")]
    A2aAgent,
    [Description("ai21 provider")]
    Ai21,
    [Description("ai21_chat provider")]
    Ai21Chat,
    [Description("aiml provider")]
    Aiml,
    [Description("aiohttp_openai provider")]
    AiohttpOpenai,
    [Description("amazon_nova provider")]
    AmazonNova,
    [Description("anthropic_text provider")]
    AnthropicText,
    [Description("apertis provider")]
    Apertis,
    [Description("assemblyai provider")]
    Assemblyai,
    [Description("auto_router provider")]
    AutoRouter,
    [Description("aws_polly provider")]
    AwsPolly,
    [Description("azure provider")]
    Azure,
    [Description("azure_ai provider")]
    AzureAi,
    [Description("azure_text provider")]
    AzureText,
    [Description("baseten provider")]
    Baseten,
    [Description("bedrock_mantle provider")]
    BedrockMantle,
    [Description("black_forest_labs provider")]
    BlackForestLabs,
    [Description("bytez provider")]
    Bytez,
    [Description("cerebras provider")]
    Cerebras,
    [Description("charity_engine provider")]
    CharityEngine,
    [Description("chatgpt provider")]
    Chatgpt,
    [Description("chutes provider")]
    Chutes,
    [Description("clarifai provider")]
    Clarifai,
    [Description("cloudflare provider")]
    Cloudflare,
    [Description("codestral provider")]
    Codestral,
    [Description("cohere provider")]
    Cohere,
    [Description("cohere_chat provider")]
    CohereChat,
    [Description("cometapi provider")]
    Cometapi,
    [Description("compactifai provider")]
    Compactifai,
    [Description("cursor provider")]
    Cursor,
    [Description("custom provider")]
    Custom,
    [Description("custom_openai provider")]
    CustomOpenai,
    [Description("darkbloom provider")]
    Darkbloom,
    [Description("dashscope provider")]
    Dashscope,
    [Description("databricks provider")]
    Databricks,
    [Description("datarobot provider")]
    Datarobot,
    [Description("deepgram provider")]
    Deepgram,
    [Description("deepinfra provider")]
    Deepinfra,
    [Description("deepseek provider")]
    Deepseek,
    [Description("docker_model_runner provider")]
    DockerModelRunner,
    [Description("dotprompt provider")]
    Dotprompt,
    [Description("empower provider")]
    Empower,
    [Description("fal_ai provider")]
    FalAi,
    [Description("featherless_ai provider")]
    FeatherlessAi,
    [Description("fireworks_ai provider")]
    FireworksAi,
    [Description("friendliai provider")]
    Friendliai,
    [Description("galadriel provider")]
    Galadriel,
    [Description("gdc provider")]
    Gdc,
    [Description("gigachat provider")]
    Gigachat,
    [Description("github provider")]
    Github,
    [Description("github_copilot provider")]
    GithubCopilot,
    [Description("gradient_ai provider")]
    GradientAi,
    [Description("helicone provider")]
    Helicone,
    [Description("heroku provider")]
    Heroku,
    [Description("hosted_vllm provider")]
    HostedVllm,
    [Description("huggingface provider")]
    Huggingface,
    [Description("humanloop provider")]
    Humanloop,
    [Description("hyperbolic provider")]
    Hyperbolic,
    [Description("inception provider")]
    Inception,
    [Description("infinity provider")]
    Infinity,
    [Description("jina_ai provider")]
    JinaAi,
    [Description("lambda_ai provider")]
    LambdaAi,
    [Description("langflow provider")]
    Langflow,
    [Description("langfuse provider")]
    Langfuse,
    [Description("langgraph provider")]
    Langgraph,
    [Description("lemonade provider")]
    Lemonade,
    [Description("libertai provider")]
    Libertai,
    [Description("litellm_agent provider")]
    LitellmAgent,
    [Description("litellm_proxy provider")]
    LitellmProxy,
    [Description("llamafile provider")]
    Llamafile,
    [Description("lm_studio provider")]
    LmStudio,
    [Description("manus provider")]
    Manus,
    [Description("maritalk provider")]
    Maritalk,
    [Description("meta provider")]
    Meta,
    [Description("meta_llama provider")]
    MetaLlama,
    [Description("milvus provider")]
    Milvus,
    [Description("minimax provider")]
    Minimax,
    [Description("modelscope provider")]
    Modelscope,
    [Description("moonshot provider")]
    Moonshot,
    [Description("morph provider")]
    Morph,
    [Description("nano-gpt provider")]
    NanoGpt,
    [Description("nebius provider")]
    Nebius,
    [Description("neosantara provider")]
    Neosantara,
    [Description("nlp_cloud provider")]
    NlpCloud,
    [Description("novita provider")]
    Novita,
    [Description("nscale provider")]
    Nscale,
    [Description("nvidia_nim provider")]
    NvidiaNim,
    [Description("nvidia_riva provider")]
    NvidiaRiva,
    [Description("oci provider")]
    Oci,
    [Description("ollama_chat provider")]
    OllamaChat,
    [Description("oobabooga provider")]
    Oobabooga,
    [Description("openai_like provider")]
    OpenaiLike,
    [Description("ovhcloud provider")]
    Ovhcloud,
    [Description("parasail provider")]
    Parasail,
    [Description("perplexity provider")]
    Perplexity,
    [Description("petals provider")]
    Petals,
    [Description("pg_vector provider")]
    PgVector,
    [Description("pinstripes provider")]
    Pinstripes,
    [Description("poe provider")]
    Poe,
    [Description("predibase provider")]
    Predibase,
    [Description("publicai provider")]
    Publicai,
    [Description("ragflow provider")]
    Ragflow,
    [Description("recraft provider")]
    Recraft,
    [Description("reducto provider")]
    Reducto,
    [Description("replicate provider")]
    Replicate,
    [Description("runwayml provider")]
    Runwayml,
    [Description("s3_vectors provider")]
    S3Vectors,
    [Description("sagemaker provider")]
    Sagemaker,
    [Description("sagemaker_chat provider")]
    SagemakerChat,
    [Description("sagemaker_nova provider")]
    SagemakerNova,
    [Description("sambanova provider")]
    Sambanova,
    [Description("sap provider")]
    Sap,
    [Description("scaleway provider")]
    Scaleway,
    [Description("snowflake provider")]
    Snowflake,
    [Description("soniox provider")]
    Soniox,
    [Description("stability provider")]
    Stability,
    [Description("synthetic provider")]
    Synthetic,
    [Description("tencent provider")]
    Tencent,
    [Description("tensormesh provider")]
    Tensormesh,
    [Description("text-completion-codestral provider")]
    TextCompletionCodestral,
    [Description("text-completion-inception provider")]
    TextCompletionInception,
    [Description("text-completion-openai provider")]
    TextCompletionOpenai,
    [Description("together_ai provider")]
    TogetherAi,
    [Description("topaz provider")]
    Topaz,
    [Description("triton provider")]
    Triton,
    [Description("v0 provider")]
    V0,
    [Description("vercel_ai_gateway provider")]
    VercelAiGateway,
    [Description("vertex_ai provider")]
    VertexAi,
    [Description("vertex_ai_beta provider")]
    VertexAiBeta,
    [Description("vllm provider")]
    Vllm,
    [Description("volcengine provider")]
    Volcengine,
    [Description("voyage provider")]
    Voyage,
    [Description("wandb provider")]
    Wandb,
    [Description("watsonx provider")]
    Watsonx,
    [Description("watsonx_text provider")]
    WatsonxText,
    [Description("xai provider")]
    Xai,
    [Description("xiaomi_mimo provider")]
    XiaomiMimo,
    [Description("xinference provider")]
    Xinference,
    [Description("zai provider")]
    Zai,
}
