using System.Text;
using WorkspaceAPIs.Features.FlowAssistant.Generated;

namespace WorkspaceAPIs.Features.FlowAssistant.Helpers;

/// <summary>
/// Ranks grounded nodes by lexical relevance to a request so the prompt carries only the configuration needed for the current turn.
/// </summary>
public static class FlowAssistantCatalogPruner
{
    private static readonly Lazy<IReadOnlyList<NodeDocument>> Documents = new(BuildDocuments);

    /// <summary>
    /// Selects the grounded node names most relevant to a request, always including the supplied names.
    /// </summary>
    public static IReadOnlyCollection<string> SelectRelevantNodeNames(
        string? query,
        IReadOnlyCollection<string>? alwaysInclude,
        int maxNodes)
    {
        var selected = new List<string>();
        var seen = new HashSet<string>(StringComparer.Ordinal);

        if (alwaysInclude is not null)
        {
            foreach (var name in alwaysInclude)
            {
                if (!string.IsNullOrWhiteSpace(name) && seen.Add(name))
                    selected.Add(name);
            }
        }

        var queryTokens = ExtractQueryTokens(query);
        if (queryTokens.Count == 0 || maxNodes <= 0)
            return selected;

        var ranked = Documents.Value
            .Select(document => (document.Name, Score: document.Score(queryTokens)))
            .Where(candidate => candidate.Score > 0d)
            .OrderByDescending(candidate => candidate.Score)
            .ThenBy(candidate => candidate.Name, StringComparer.Ordinal);

        var scored = 0;
        foreach (var candidate in ranked)
        {
            if (scored >= maxNodes)
                break;

            if (seen.Add(candidate.Name))
            {
                selected.Add(candidate.Name);
                scored++;
            }
        }

        return selected;
    }

    private static IReadOnlyList<NodeDocument> BuildDocuments()
    {
        var raw = new List<(string Name, Dictionary<string, double> Tokens)>();
        foreach (var node in FlowAssistantCatalog.AllowedNodesForPrompt)
        {
            var tokens = new Dictionary<string, double>(StringComparer.Ordinal);
            AddTokens(tokens, node.Name, 1.5);
            AddTokens(tokens, node.Label, 1.0);
            AddTokens(tokens, node.Description, 0.6);
            raw.Add((node.Name, tokens));
        }

        var documentFrequency = new Dictionary<string, int>(StringComparer.Ordinal);
        foreach (var entry in raw)
        {
            foreach (var token in entry.Tokens.Keys)
                documentFrequency[token] = documentFrequency.GetValueOrDefault(token) + 1;
        }

        var total = raw.Count;
        var documents = new List<NodeDocument>(total);
        foreach (var entry in raw)
        {
            var weighted = new Dictionary<string, double>(StringComparer.Ordinal);
            foreach (var token in entry.Tokens)
            {
                var idf = Math.Log((total + 1.0) / (documentFrequency[token.Key] + 0.5));
                weighted[token.Key] = token.Value * (1.0 + Math.Max(idf, 0d));
            }

            documents.Add(new NodeDocument(entry.Name, weighted));
        }

        return documents;
    }

    private static void AddTokens(Dictionary<string, double> tokens, string text, double weight)
    {
        foreach (var raw in Tokenize(text))
        {
            var token = Canonical(raw);
            if (token.Length < 2 || StopWords.Contains(token))
                continue;

            tokens[token] = Math.Max(tokens.GetValueOrDefault(token), weight);
        }
    }

    private static HashSet<string> ExtractQueryTokens(string? query)
    {
        var tokens = new HashSet<string>(StringComparer.Ordinal);
        if (string.IsNullOrWhiteSpace(query))
            return tokens;

        foreach (var raw in Tokenize(query))
        {
            var token = Canonical(raw);
            if (token.Length < 2 || StopWords.Contains(token))
                continue;

            tokens.Add(token);
        }

        return tokens;
    }

    private static string Canonical(string token) => TokenAliasGroups.GetValueOrDefault(token, token);

    private static IEnumerable<string> Tokenize(string text)
    {
        var buffer = new StringBuilder();
        foreach (var character in text)
        {
            if (!char.IsLetterOrDigit(character))
            {
                if (buffer.Length > 0)
                {
                    yield return buffer.ToString().ToLowerInvariant();
                    buffer.Clear();
                }

                continue;
            }

            if (char.IsUpper(character) && buffer.Length > 0)
            {
                yield return buffer.ToString().ToLowerInvariant();
                buffer.Clear();
            }

            buffer.Append(character);
        }

        if (buffer.Length > 0)
            yield return buffer.ToString().ToLowerInvariant();
    }

    private static readonly HashSet<string> StopWords = new(StringComparer.Ordinal)
    {
        "a", "an", "the", "and", "or", "of", "to", "in", "on", "at", "for", "with", "from", "by", "as", "is", "are",
        "be", "been", "being", "this", "that", "these", "those", "it", "its", "my", "our", "your", "their", "them",
        "they", "we", "you", "me", "us", "then", "than", "when", "while", "which", "what", "who", "how", "why",
        "where", "do", "does", "did", "done", "so", "such", "if", "else", "but", "not", "no", "yes", "can", "could",
        "should", "would", "will", "shall", "may", "might", "must", "have", "has", "had", "into", "out", "up", "down",
        "over", "under", "again", "also", "just", "only", "any", "all", "some", "new", "please",
        "want", "wanted", "need", "needed", "make", "made", "use", "used", "using", "node", "nodes", "flow", "flows",
        "step", "steps", "action", "actions", "activity", "activities", "thing", "things",
    };

    private static readonly Dictionary<string, string> TokenAliasGroups = new(StringComparer.Ordinal)
    {
        ["file"] = "file", ["files"] = "file", ["doc"] = "file", ["docs"] = "file", ["document"] = "file",
        ["documents"] = "file", ["attachment"] = "file", ["attachments"] = "file", ["pdf"] = "file",
        ["csv"] = "file",
        ["folder"] = "folder", ["folders"] = "folder", ["directory"] = "folder", ["directories"] = "folder",
        ["dir"] = "folder", ["subfolder"] = "folder", ["subfolders"] = "folder",
        ["path"] = "folder", ["paths"] = "folder", ["location"] = "folder", ["drive"] = "folder",
        ["shared"] = "folder", ["share"] = "folder", ["sharepoint"] = "folder", ["onedrive"] = "folder",
        ["dropbox"] = "folder",
        ["ai"] = "ai", ["agent"] = "ai", ["agents"] = "ai", ["llm"] = "ai", ["model"] = "ai", ["models"] = "ai",
        ["gpt"] = "ai", ["gemini"] = "ai", ["openai"] = "ai", ["inference"] = "ai", ["inferencing"] = "ai",
        ["chatbot"] = "ai", ["intelligence"] = "ai",
        ["email"] = "email", ["emails"] = "email", ["mail"] = "email", ["outlook"] = "email", ["smtp"] = "email",
        ["excel"] = "excel", ["xlsx"] = "excel", ["xls"] = "excel", ["spreadsheet"] = "excel",
        ["workbook"] = "excel", ["worksheet"] = "excel",
        ["sql"] = "sql", ["database"] = "sql", ["databases"] = "sql", ["db"] = "sql", ["mssql"] = "sql",
        ["mysql"] = "sql", ["postgres"] = "sql", ["postgresql"] = "sql",
        ["http"] = "http", ["https"] = "http", ["api"] = "http", ["rest"] = "http", ["endpoint"] = "http",
        ["url"] = "http", ["uri"] = "http", ["webhook"] = "http", ["web"] = "http", ["webrequest"] = "http",
        ["json"] = "json",
        ["image"] = "image", ["images"] = "image", ["photo"] = "image", ["photos"] = "image", ["picture"] = "image",
        ["pictures"] = "image", ["screenshot"] = "image",
        ["ocr"] = "ocr", ["tesseract"] = "ocr", ["scan"] = "ocr",
        ["loop"] = "loop", ["loops"] = "loop", ["repeat"] = "loop", ["iterate"] = "loop", ["iteration"] = "loop",
        ["foreach"] = "loop", ["each"] = "loop", ["batch"] = "loop",
        ["condition"] = "condition", ["conditions"] = "condition", ["conditional"] = "condition", ["branch"] = "condition",
        ["router"] = "condition", ["route"] = "condition", ["decision"] = "condition", ["decide"] = "condition",
        ["variable"] = "variable", ["variables"] = "variable", ["var"] = "variable",
        ["list"] = "list", ["lists"] = "list", ["array"] = "list", ["arrays"] = "list", ["collection"] = "list",
        ["collections"] = "list",
        ["date"] = "date", ["dates"] = "date", ["datetime"] = "date", ["time"] = "date", ["timestamp"] = "date",
        ["schedule"] = "date", ["scheduled"] = "date", ["daily"] = "date", ["every"] = "date",
        ["text"] = "text", ["string"] = "text", ["strings"] = "text", ["substring"] = "text",
        ["queue"] = "queue", ["queues"] = "queue", ["workitem"] = "queue", ["workitems"] = "queue",
        ["task"] = "queue", ["tasks"] = "queue", ["ticket"] = "queue", ["tickets"] = "queue",
        ["log"] = "log", ["logs"] = "log", ["logging"] = "log",
        ["table"] = "table", ["tables"] = "table", ["datatable"] = "table", ["datatables"] = "table",
        ["number"] = "number", ["numbers"] = "number", ["numeric"] = "number", ["integer"] = "number",
        ["decimal"] = "number", ["math"] = "number", ["calculate"] = "number", ["calculation"] = "number",
        ["wait"] = "wait", ["delay"] = "wait", ["pause"] = "wait", ["sleep"] = "wait", ["timeout"] = "wait",
        ["notify"] = "notify", ["notification"] = "notify", ["notifications"] = "notify", ["alert"] = "notify",
        ["alerts"] = "notify",
        ["extract"] = "extract", ["extraction"] = "extract", ["extracting"] = "extract", ["parse"] = "extract",
        ["parsing"] = "extract",
        ["convert"] = "convert", ["conversion"] = "convert", ["transform"] = "convert",
        ["execute"] = "execute", ["run"] = "execute", ["invoke"] = "execute", ["call"] = "execute",
        ["write"] = "write", ["save"] = "write", ["export"] = "write",
        ["read"] = "read", ["load"] = "read", ["open"] = "read", ["import"] = "read",
        ["delete"] = "delete", ["remove"] = "delete", ["clear"] = "delete",
        ["create"] = "create", ["generate"] = "create", ["add"] = "create", ["insert"] = "create",
        ["update"] = "update", ["modify"] = "update", ["edit"] = "update", ["change"] = "update",
        ["split"] = "split", ["separate"] = "split",
        ["join"] = "join", ["merge"] = "join", ["combine"] = "join", ["concatenate"] = "join", ["append"] = "join",
        ["filter"] = "filter",
        ["sort"] = "sort", ["order"] = "sort", ["rank"] = "sort",
        ["send"] = "send", ["post"] = "send", ["publish"] = "send", ["upload"] = "send",
        ["teams"] = "teams", ["slack"] = "slack",
    };

    private sealed class NodeDocument
    {
        private readonly IReadOnlyDictionary<string, double> _tokenWeights;

        public NodeDocument(string name, IReadOnlyDictionary<string, double> tokenWeights)
        {
            Name = name;
            _tokenWeights = tokenWeights;
        }

        public string Name { get; }

        public double Score(IReadOnlyCollection<string> queryTokens)
        {
            var score = 0d;
            foreach (var token in queryTokens)
            {
                if (_tokenWeights.TryGetValue(token, out var weight))
                    score += weight;
            }

            return score;
        }
    }
}
