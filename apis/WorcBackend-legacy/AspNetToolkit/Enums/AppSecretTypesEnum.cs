namespace AspNetToolkit.Enums;

/// <summary>
/// Specifies the types of application secrets used to integrate with third-party services.
/// </summary>
public enum AppSecretTypesEnum
{
    [Description("OpenAI API Key")]
    OpenAI,
    [Description("AWS Credentials")]
    AWS,
    [Description("Twilio API Credentials")]
    Twilio,
    [Description("SendGrid API Key")]
    SendGrid,
    [Description("github Credentials")]
    GitHub,
    [Description("M365 Credentials")]
    M365,
    [Description("General Credentials")]
    GeneralCredentials,
    [Description("Anthropic Credentials")]
    Anthropic,
    [Description("Google Gemini Credentials")]
    GoogleGemini,
    [Description("Google Workspace Credentials")]
    GoogleWorkspace,
    [Description("Azure OpenAI Credentials")]
    AzureOpenAI,
    [Description("ElevenLabs Credentials")]
    ElevenLabs,
    [Description("OpenRouter Credentials")]
    OpenRouter,
    [Description("Azure Storage Credentials")]
    AzureStorage,
    [Description("Connection String Credentials")]
    ConnectionString,
    [Description("Qdrant Credentials")]
    Qdrant,
    [Description("Ollama On-prem Credentials")]
    Ollama,
    [Description("Ollama Cloud Credentials")]
    OllamaCloud,
    [Description("Groq Credentials")]
    Groq,
    [Description("Bedrock Credentials")]
    Bedrock,
    [Description("Mistral Credentials")]
    Mistral,
    EmailClient,
    AzureBlobStorage,
    [Description("Custom API Tool Credentials")]
    CustomApiTool,

    // --- Individual LiteLLM provider types (generated) ---
    [Description("a2a Credentials")]
    A2a,
    [Description("a2a_agent Credentials")]
    A2aAgent,
    [Description("ai21 Credentials")]
    Ai21,
    [Description("ai21_chat Credentials")]
    Ai21Chat,
    [Description("aiml Credentials")]
    Aiml,
    [Description("aiohttp_openai Credentials")]
    AiohttpOpenai,
    [Description("amazon_nova Credentials")]
    AmazonNova,
    [Description("anthropic_text Credentials")]
    AnthropicText,
    [Description("apertis Credentials")]
    Apertis,
    [Description("assemblyai Credentials")]
    Assemblyai,
    [Description("auto_router Credentials")]
    AutoRouter,
    [Description("aws_polly Credentials")]
    AwsPolly,
    [Description("azure Credentials")]
    Azure,
    [Description("azure_ai Credentials")]
    AzureAi,
    [Description("azure_text Credentials")]
    AzureText,
    [Description("baseten Credentials")]
    Baseten,
    [Description("bedrock_mantle Credentials")]
    BedrockMantle,
    [Description("black_forest_labs Credentials")]
    BlackForestLabs,
    [Description("bytez Credentials")]
    Bytez,
    [Description("cerebras Credentials")]
    Cerebras,
    [Description("charity_engine Credentials")]
    CharityEngine,
    [Description("chatgpt Credentials")]
    Chatgpt,
    [Description("chutes Credentials")]
    Chutes,
    [Description("clarifai Credentials")]
    Clarifai,
    [Description("cloudflare Credentials")]
    Cloudflare,
    [Description("codestral Credentials")]
    Codestral,
    [Description("cohere Credentials")]
    Cohere,
    [Description("cohere_chat Credentials")]
    CohereChat,
    [Description("cometapi Credentials")]
    Cometapi,
    [Description("compactifai Credentials")]
    Compactifai,
    [Description("cursor Credentials")]
    Cursor,
    [Description("custom Credentials")]
    Custom,
    [Description("custom_openai Credentials")]
    CustomOpenai,
    [Description("darkbloom Credentials")]
    Darkbloom,
    [Description("dashscope Credentials")]
    Dashscope,
    [Description("databricks Credentials")]
    Databricks,
    [Description("datarobot Credentials")]
    Datarobot,
    [Description("deepgram Credentials")]
    Deepgram,
    [Description("deepinfra Credentials")]
    Deepinfra,
    [Description("deepseek Credentials")]
    Deepseek,
    [Description("docker_model_runner Credentials")]
    DockerModelRunner,
    [Description("dotprompt Credentials")]
    Dotprompt,
    [Description("empower Credentials")]
    Empower,
    [Description("fal_ai Credentials")]
    FalAi,
    [Description("featherless_ai Credentials")]
    FeatherlessAi,
    [Description("fireworks_ai Credentials")]
    FireworksAi,
    [Description("friendliai Credentials")]
    Friendliai,
    [Description("galadriel Credentials")]
    Galadriel,
    [Description("gdc Credentials")]
    Gdc,
    [Description("gigachat Credentials")]
    Gigachat,
    [Description("github_copilot Credentials")]
    GithubCopilot,
    [Description("gradient_ai Credentials")]
    GradientAi,
    [Description("helicone Credentials")]
    Helicone,
    [Description("heroku Credentials")]
    Heroku,
    [Description("hosted_vllm Credentials")]
    HostedVllm,
    [Description("huggingface Credentials")]
    Huggingface,
    [Description("humanloop Credentials")]
    Humanloop,
    [Description("hyperbolic Credentials")]
    Hyperbolic,
    [Description("inception Credentials")]
    Inception,
    [Description("infinity Credentials")]
    Infinity,
    [Description("jina_ai Credentials")]
    JinaAi,
    [Description("lambda_ai Credentials")]
    LambdaAi,
    [Description("langflow Credentials")]
    Langflow,
    [Description("langfuse Credentials")]
    Langfuse,
    [Description("langgraph Credentials")]
    Langgraph,
    [Description("lemonade Credentials")]
    Lemonade,
    [Description("libertai Credentials")]
    Libertai,
    [Description("litellm_agent Credentials")]
    LitellmAgent,
    [Description("litellm_proxy Credentials")]
    LitellmProxy,
    [Description("llamafile Credentials")]
    Llamafile,
    [Description("lm_studio Credentials")]
    LmStudio,
    [Description("manus Credentials")]
    Manus,
    [Description("maritalk Credentials")]
    Maritalk,
    [Description("meta Credentials")]
    Meta,
    [Description("meta_llama Credentials")]
    MetaLlama,
    [Description("milvus Credentials")]
    Milvus,
    [Description("minimax Credentials")]
    Minimax,
    [Description("modelscope Credentials")]
    Modelscope,
    [Description("moonshot Credentials")]
    Moonshot,
    [Description("morph Credentials")]
    Morph,
    [Description("nano-gpt Credentials")]
    NanoGpt,
    [Description("nebius Credentials")]
    Nebius,
    [Description("neosantara Credentials")]
    Neosantara,
    [Description("nlp_cloud Credentials")]
    NlpCloud,
    [Description("novita Credentials")]
    Novita,
    [Description("nscale Credentials")]
    Nscale,
    [Description("nvidia_nim Credentials")]
    NvidiaNim,
    [Description("nvidia_riva Credentials")]
    NvidiaRiva,
    [Description("oci Credentials")]
    Oci,
    [Description("ollama_chat Credentials")]
    OllamaChat,
    [Description("oobabooga Credentials")]
    Oobabooga,
    [Description("openai_like Credentials")]
    OpenaiLike,
    [Description("ovhcloud Credentials")]
    Ovhcloud,
    [Description("parasail Credentials")]
    Parasail,
    [Description("perplexity Credentials")]
    Perplexity,
    [Description("petals Credentials")]
    Petals,
    [Description("pg_vector Credentials")]
    PgVector,
    [Description("pinstripes Credentials")]
    Pinstripes,
    [Description("poe Credentials")]
    Poe,
    [Description("predibase Credentials")]
    Predibase,
    [Description("publicai Credentials")]
    Publicai,
    [Description("ragflow Credentials")]
    Ragflow,
    [Description("recraft Credentials")]
    Recraft,
    [Description("reducto Credentials")]
    Reducto,
    [Description("replicate Credentials")]
    Replicate,
    [Description("runwayml Credentials")]
    Runwayml,
    [Description("s3_vectors Credentials")]
    S3Vectors,
    [Description("sagemaker Credentials")]
    Sagemaker,
    [Description("sagemaker_chat Credentials")]
    SagemakerChat,
    [Description("sagemaker_nova Credentials")]
    SagemakerNova,
    [Description("sambanova Credentials")]
    Sambanova,
    [Description("sap Credentials")]
    Sap,
    [Description("scaleway Credentials")]
    Scaleway,
    [Description("snowflake Credentials")]
    Snowflake,
    [Description("soniox Credentials")]
    Soniox,
    [Description("stability Credentials")]
    Stability,
    [Description("synthetic Credentials")]
    Synthetic,
    [Description("tencent Credentials")]
    Tencent,
    [Description("tensormesh Credentials")]
    Tensormesh,
    [Description("text-completion-codestral Credentials")]
    TextCompletionCodestral,
    [Description("text-completion-inception Credentials")]
    TextCompletionInception,
    [Description("text-completion-openai Credentials")]
    TextCompletionOpenai,
    [Description("together_ai Credentials")]
    TogetherAi,
    [Description("topaz Credentials")]
    Topaz,
    [Description("triton Credentials")]
    Triton,
    [Description("v0 Credentials")]
    V0,
    [Description("vercel_ai_gateway Credentials")]
    VercelAiGateway,
    [Description("vertex_ai Credentials")]
    VertexAi,
    [Description("vertex_ai_beta Credentials")]
    VertexAiBeta,
    [Description("vllm Credentials")]
    Vllm,
    [Description("volcengine Credentials")]
    Volcengine,
    [Description("voyage Credentials")]
    Voyage,
    [Description("wandb Credentials")]
    Wandb,
    [Description("watsonx Credentials")]
    Watsonx,
    [Description("watsonx_text Credentials")]
    WatsonxText,
    [Description("xai Credentials")]
    Xai,
    [Description("xiaomi_mimo Credentials")]
    XiaomiMimo,
    [Description("xinference Credentials")]
    Xinference,
    [Description("zai Credentials")]
    Zai,

    // Corsair integrations (generated)
    Ably,
    Abstract,
    Abuseipdb,
    Abyssale,
    Accrediblecertificates,
    Activecampaign,
    Activetrail,
    Addresszen,
    Aeroleads,
    Affinda,
    Agencyzoom,
    Agentmail,
    Agentql,
    Agenty,
    Agilitycms,
    Ahrefs,
    Aimlapi,
    Airtable,
    Aivoov,
    Alchemy,
    Algolia,
    Allimagesai,
    Alphavantage,
    Altoviz,
    Alttextai,
    Amara,
    Ambee,
    Ambientweather,
    Amcards,
    Amplitude,
    Anchorbrowser,
    Anonyflow,
    Apaleo,
    Api2pdf,
    Apibible,
    Apify,
    Apilabz,
    Apininjas,
    Apipie,
    Apisports,
    Asana,
    Asindataapi,
    Asticaai,
    Asyncinterview,
    Attio,
    Autom,
    Ayrshare,
    Backendless,
    Bannerbear,
    Bart,
    Basecamp,
    Baselinker,
    Basin,
    Beaconstac,
    Beeminder,
    Bettercontact,
    Betterproposals,
    Betterstack,
    Bigdatacloud,
    Bigmailer,
    Bigml,
    Bitbucket,
    Bitwarden,
    Blazemeter,
    Blocknative,
    Bluesky,
    Boloforms,
    Boltiot,
    Bonsai,
    Bookingmood,
    Botpress,
    Botsonic,
    Bouncer,
    Box,
    Boxhero,
    Brandfetch,
    Brex,
    Browseai,
    Browserless,
    Bugsnag,
    Cal,
    Calendly,
    Canva,
    Canvas,
    Chatbotkit,
    Circleci,
    Clickhouse,
    Clientary,
    Clockify,
    Cloudinary,
    Collegefootballdata,
    Confluence,
    Contentfulgraphql,
    Contextsevenmcp,
    Crowterminal,
    Customgpt,
    Datadog,
    Devinmcp,
    Diffbot,
    Digitalocean,
    Discord,
    Dockerhub,
    Dodopayments,
    Doppler,
    Dreamstudio,
    Dropbox,
    Dropboxsign,
    Epicgames,
    Exa,
    Facebook,
    Faraday,
    Figma,
    Firecrawl,
    Fireflies,
    Formbricks,
    Gitlab,
    Grafana,
    Groqcloud,
    Habitica,
    Hackernews,
    Harvest,
    Hashnode,
    Here,
    Heygen,
    Htmltoimage,
    Hubspot,
    Imgbb,
    Insightoai,
    Instagram,
    Intercom,
    Jigsawstack,
    Jira,
    Kaggle,
    Linear,
    Linkedin,
    Loyverse,
    Mailboxlayer,
    Mailchimp,
    Mailtrap,
    Merriamwebsterdict,
    Monday,
    Neon,
    Nextdns,
    Notion,
    Ocrspace,
    Ocrwebservice,
    Onedrive,
    Onepassword,
    Openweathermap,
    Oura,
    Pagerduty,
    Pdfmonkey,
    Perplexityai,
    Pinecone,
    Posthog,
    Razorpay,
    Reddit,
    Retailed,
    Salesforce,
    Securitytrails,
    Sentry,
    Serpapi,
    Sharepoint,
    Slack,
    Sourcegraph,
    Spotify,
    Strava,
    Streamtime,
    Stripe,
    Studiobyai21labs,
    Supabase,
    Synthflowai,
    Tally,
    Tavily,
    Tavilymcp,
    Teams,
    Telegram,
    Textrazor,
    Ticktick,
    Timecamp,
    Tisane,
    Todoist,
    Toggl,
    Trello,
    Twentyonerisk,
    Twitter,
    Twitterapiio,
    Twochat,
    Typeform,
    Unione,
    Uniswapapi,
    Vapi,
    Vercel,
    Vestaboard,
    Wakatime,
    Webflow,
    Webvizio,
    Whatsapp,
    Witai,
    Wiza,
    Workday,
    Xquik,
    Youcom,
    Youtube,
    Zendesk,
    Zohomail,
    Zoom,
    Zoominfo,
}
