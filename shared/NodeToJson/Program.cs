namespace NodeToJson;

internal class Program
{
    static List<string> _excludedNodeL1Categories = new List<string>
    {
        "None"
    };

    static List<string> _excludedNodeL2Categories = new List<string>
    {
        "None"
    };

    static List<string> _excludedNodes = new List<string>
    {
        "InvokeSoapWebServiceNode",
        "ConditionalNode",
        "ConditionalBranchNode",
        "LoopNode",
        "GetWorkItemNode",
    };

    static void Main(string[] args)
    {
        // Force-load the assembly by name
        var nodeLibraryAssembly = AppDomain.CurrentDomain.GetAssemblies().FirstOrDefault(a => a.GetName().Name == "NodeLibrary");

        // Load manually if not already loaded
        if (nodeLibraryAssembly == null) nodeLibraryAssembly = Assembly.Load("NodeLibrary");

        // Search all Level 1 category types with the [NodeL1CategoryMetadata] attribute
        var nodeL1CategoryTypes = nodeLibraryAssembly.GetTypes().Where(t => t.GetCustomAttributes(typeof(NodeL1CategoryMetadataAttribute), inherit: false).Any()).ToList();

        // Level 1 not found, exit the program
        if (nodeL1CategoryTypes.Count == 0)
        {
            Console.WriteLine("No Node Level 1 category found in the assembly.");
            return;
        }

        // Initialize LocalAppData, mapping object and json serializer settings
        var jsonSerializerOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = true
        };
        var nodeMappingObject = new List<NodeL1CategoryModel>();

        // Loop through each level 1 node category
        foreach (var nodeL1CategoryType in nodeL1CategoryTypes)
        {
            // Skip if namespace is null
            if (nodeL1CategoryType.Namespace == null) continue;

            // Skip excluded node L1 categories
            if (_excludedNodeL1Categories.Contains(nodeL1CategoryType.Namespace))
            {
                Console.WriteLine($"Skipping node level 1 category - {nodeL1CategoryType.Namespace}");
                continue;
            }

            // Get metadata attribute from the type
            var nodeL1CategoryMetadata = nodeL1CategoryType.GetCustomAttributes(typeof(NodeL1CategoryMetadataAttribute), false).FirstOrDefault() as NodeL1CategoryMetadataAttribute;
            if (nodeL1CategoryMetadata == null) continue;

            // Create node level 1 category object
            var nodeL1Category = new NodeL1CategoryModel
            {
                Label = nodeL1CategoryMetadata.Label,
                Description = nodeL1CategoryMetadata.Description,
                Icon = nodeL1CategoryMetadata.Icon,
            };

            // Get types with NodeL2CategoryMetadata attribute within the same namespace as the nodeL1CategoryType
            var nodeL2CategoryTypes = nodeLibraryAssembly.GetTypes().Where(t =>
                                            t.GetCustomAttributes(typeof(NodeL2CategoryMetadataAttribute), inherit: false).Any() &&
                                            t.Namespace != null &&
                                            (t.Namespace == nodeL1CategoryType.Namespace || t.Namespace.StartsWith(nodeL1CategoryType.Namespace + "."))).ToList();

            // Loop through each level 2 node category
            foreach (var nodeL2CategoryType in nodeL2CategoryTypes)
            {
                // Skip if namespace is null
                if (nodeL2CategoryType.Namespace == null) continue;

                // Skip excluded node L2 categories
                if (_excludedNodeL2Categories.Contains(nodeL2CategoryType.Namespace))
                {
                    Console.WriteLine($"Skipping node level 2 category - {nodeL2CategoryType.Namespace}");
                    continue;
                }

                // Get metadata attribute from the type
                var nodeL2CategoryMetadata = nodeL2CategoryType.GetCustomAttributes(typeof(NodeL2CategoryMetadataAttribute), false).FirstOrDefault() as NodeL2CategoryMetadataAttribute;
                if (nodeL2CategoryMetadata == null) continue;

                // Create node level 2 category object
                var nodeL2Category = new NodeL2CategoryModel
                {
                    Label = nodeL2CategoryMetadata.Label,
                    Description = nodeL2CategoryMetadata.Description,
                    Icon = nodeL2CategoryMetadata.Icon,
                    DoNotRenderIf = nodeL2CategoryMetadata.DoNotRenderIf != null ? nodeL2CategoryMetadata.DoNotRenderIf.Split(',').ToList() : null,
                };

                // Get types with NodeL2CategoryMetadata attribute within the same namespace as the nodeL1CategoryType
                var nodeTypes = nodeLibraryAssembly.GetTypes().Where(t =>
                                            t.GetCustomAttributes(typeof(NodeMetadataAttribute), inherit: false).Any() &&
                                            t.Namespace != null &&
                                            (t.Namespace == nodeL2CategoryType.Namespace)).ToList();

                // Loop through each node type
                foreach (var nodeType in nodeTypes)
                {
                    // Skip if name is null
                    if (nodeType.Name == null) continue;

                    // Skip excluded nodes
                    if (_excludedNodes.Contains(nodeType.Name))
                    {
                        Console.WriteLine($"Skipping node - {nodeType.Name}");
                        continue;
                    }

                    // Get DisplayName, Description and NodeMetadata attributes
                    var nodeDisplayName = nodeType.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
                    var nodeDescription = nodeType.GetCustomAttributes(typeof(DescriptionAttribute), false).FirstOrDefault() as DescriptionAttribute;
                    var nodeMetaData = nodeType.GetCustomAttributes(typeof(NodeMetadataAttribute), false).FirstOrDefault() as NodeMetadataAttribute;
                    var nodeSupportedPlatforms = nodeMetaData?.SupportedPlatforms != null
                                                ? nodeMetaData?.SupportedPlatforms.Split(',').ToList()
                                                : nodeL2CategoryMetadata?.SupportedPlatforms?.Split(',').ToList();

                    // Skip if DisplayName is null or empty, which means we don't want to generate JSON for it
                    if (nodeDisplayName == null || string.IsNullOrEmpty(nodeDisplayName.DisplayName) || nodeDescription == null || string.IsNullOrEmpty(nodeDescription.Description))
                    {
                        Console.WriteLine($"Skipping node with no display name or description - {nodeType.Name}");
                        continue;
                    }

                    // Add the node to the level 2 category
                    nodeL2Category.Nodes.Add(new NodeMetadataModel
                    {
                        Type = nodeMetaData?.NodeType ?? "defaultNode",
                        Name = nodeType.Name,
                        Label = nodeDisplayName.DisplayName,
                        Description = nodeDescription.Description,
                        Icon = nodeMetaData?.Icon ?? "/function.png",
                        DocsLink = nodeMetaData?.DocsLink ?? "https://docs.aventisia.com",
                        SupportedPlatforms = nodeSupportedPlatforms,
                        DoNotRenderIf = nodeMetaData?.DoNotRenderIf != null ? nodeMetaData?.DoNotRenderIf.Split(',').ToList() : null,
                    });

                    // Create node json file
                    var nodeJson = NodeToJsonHelper.ConvertNodeToJson(nodeType, nodeSupportedPlatforms);
                    if (string.IsNullOrEmpty(nodeJson) || nodeJson == "[]")
                    {
                        Console.WriteLine($"Failed to convert {nodeType.Name} to JSON.");
                        continue;
                    }

                    // Save node json to worc-platform repo. TODO: Till the time whole migration from .net framework to .net core is done, we are keeping the file name nodeType.Name.Replace("Node", "Activity") as is to avoid breaking changes 
                    var nodeJsonFilePath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "worc-web-legacy", "studio", "src", "features", "dynamic-config-panel", "constants", "config-json", nodeType.Name.Replace("Node", "Activity") + ".json"));
                    WriteJsonToFile(nodeJsonFilePath, nodeJson, jsonSerializerOptions);

                    // Save the same file in LocalAppData/WorcDesktopApp (if applicable)
                    if (OperatingSystem.IsWindows())
                    {
                        nodeJsonFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "WorcDesktopApp", "config-files", "desktop-nodes", nodeType.Name.Replace("Node", "Activity") + ".json");
                        WriteJsonToFile(nodeJsonFilePath, nodeJson, jsonSerializerOptions);
                    }
                }

                // Add the level 2 category to the level 1 category
                nodeL1Category.NodeL2Categories.Add(nodeL2Category);
            }

            // Add the level 1 category to the mapping object
            nodeMappingObject.Add(nodeL1Category);
        }

        // Save _NodeSelectorData.json to the worc-platform repo. TODO: Till the time whole migration from .net framework to .net core is done, we are keeping the file name as _ActionSelectorData.json as is to avoid breaking changes
        var nodeSelectorJsonFilePath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "worc-web-legacy", "studio", "src", "features", "action-selector", "constants", "_ActionSelectorData.json"));
        WriteJsonToFile(nodeSelectorJsonFilePath, nodeMappingObject, jsonSerializerOptions, "Nodes mapping JSON saved to worc-platform repo");

        // Save same file _NodeSelectorData.json to LocalAppData/WorcDesktopApp (if applicable)
        if (OperatingSystem.IsWindows())
        {
            nodeSelectorJsonFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "WorcDesktopApp", "config-files", "action-selector", "_ActionSelectorData.json");
            WriteJsonToFile(nodeSelectorJsonFilePath, nodeMappingObject, jsonSerializerOptions, "Node selector mapping JSON saved to AppData/Local/WorcDesktopApp");
        }

        Console.WriteLine("Task complete");
        Console.ReadLine();
    }

    // Helper method to write JSON to file with Unix line endings
    static void WriteJsonToFile(string filePath, object data, JsonSerializerOptions options, string? successMessage = null)
    {
        // Create directory if it doesn't exist
        var directory = Path.GetDirectoryName(filePath) ?? throw new InvalidOperationException("Could not determine directory from file path.");
        if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);

        using (var writer = new StreamWriter(filePath))
        {
            writer.NewLine = "\n";
            var json = data is string s ? s : JsonSerializer.Serialize(data, options);
            var jsonWithUnixLineEndings = json.Replace("\r\n", "\n");
            writer.Write(jsonWithUnixLineEndings);
            if (!string.IsNullOrEmpty(successMessage)) Console.WriteLine(successMessage);
        }
    }
}