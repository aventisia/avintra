namespace AspNetToolkit.Utils;

public static class IconSorterUtil
{
    // Defines the priority for each icon. A lower number indicates a higher priority.
    private static readonly IReadOnlyDictionary<string, int> IconPriorityMap = new Dictionary<string, int>
    {
        // LLM & AI providers
        { "/assets/openai.svg", 1},         // OpenAI (ChatGPT / GPT models)
        { "/assets/gemini.svg", 2},         // Google DeepMind's Gemini
        { "/assets/grok.svg", 3},           // xAI's Grok
        { "/assets/claude.svg", 4},         // Anthropic's Claude
        { "/assets/llama.svg", 5},          // Meta's LLaMA (Large Language Model Meta AI)
        { "/assets/phi.svg", 6},            // Microsoft’s Phi models (lightweight LLMs)
        { "/assets/mistral.svg", 7},        // Mistral AI (open-weight models like Mixtral)
        { "/assets/deepseek.svg", 8},       // DeepSeek (Chinese AI lab, efficiency-focused models)
        { "/assets/gemma.svg", 9},          // Google’s Gemma (open lightweight model family)
        { "/assets/elevenlabs.svg", 10},    // ElevenLabs (AI voice synthesis / TTS)

        // Cloud services
        {"/assets/aws.svg", 11},            // Amazon Web Services
        {"/assets/azure.svg", 12},          // Microsoft Azure

        // Databases
        {"/assets/qdrant.svg", 13},         // Qdrant (vector database for embeddings/AI search)
        {"/assets/postgres.svg", 14},       // PostgreSQL (relational database)

        // App integration
        {"/assets/sendgrid.svg", 15},           // SendGrid (email delivery)
        {"/assets/twilio.svg", 16},             // Twilio (SMS, voice, messaging APIs)
        {"/assets/drive.svg", 17},              // Google Drive (file storage & sync)
        {"/assets/onedrive.svg", 18},           // Microsoft OneDrive (file storage & sync)
        {"/assets/google_drive.svg", 19},       // Google Drive (duplicate entry with different icon?)
        {"/assets/aws_secretmanager.svg", 20},  // AWS Secrets Manager (store & retrieve secrets)
        {"/assets/aws_s3.svg", 21},             // AWS S3 (object storage service)

        // Agent nodes (automation & tools)
        {"/assets/BrowserAutomation.svg", 22},  // Browser automation (web interaction tasks)
        {"/assets/Clipboard.svg", 23},          // Clipboard operations (copy/paste handling)
        {"/assets/CredentialManager.svg", 24},  // Credential manager (secure credentials)
        {"/assets/DDOSession.svg", 25},         // DDO Session (possibly Distributed Data Objects / session handling)
        {"/assets/Compression.svg", 26},        // Compression utilities (zip/unzip files)
        {"/assets/Excel.svg", 27},              // Microsoft Excel automation
        {"/assets/Folder.svg", 28},             // Folder operations (file system management)
        {"/assets/File.svg", 29},               // File operations (create, read, write, delete)
        {"/assets/MouseAndKeyBoard.svg", 30},   // Mouse & keyboard automation (RPA-style input)
        {"/assets/Messaging.svg", 31},          // Messaging integration (generic message handling)
        {"/assets/Outlook.svg", 32},            // Microsoft Outlook automation (emails, calendar)
        {"/assets/System.svg", 33},             // System operations (OS-level commands/utilities)
        {"/assets/Scripting.svg", 34},          // Scripting (run code snippets/scripts)
        {"/assets/UIAutomation.svg", 35},       // UI automation (RPA / screen element interaction)
        {"/assets/WebAutomation.svg", 36},      // Web automation (web scraping, form filling)
        {"/assets/Word.svg", 37},               // Microsoft Word automation
        {"/assets/WindowsService.svg", 38},     // Windows Services (manage background processes)
        {"/assets/XML.svg", 39}                 // XML handling (parse, create, transform)
    };

    // Sorts a collection of icon names according to their predefined priority.
    public static List<string> SortByPriority(IEnumerable<string> iconNames)
    {
        // Order the list by looking up each icon's priority.
        // If an icon is not found in the map, GetValueOrDefault assigns it
        // int.MaxValue, which places it at the very end of the sorted list.
        return iconNames
            .OrderBy(o => 
                IconPriorityMap.GetValueOrDefault(o, int.MaxValue)
            )
            .ToList();
    }
}