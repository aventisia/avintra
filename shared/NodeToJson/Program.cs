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

        // Build L1/L2 hierarchy from the NodeLibrary source folder structure because namespaces do not nest.
        var repoRoot = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", ".."));
        var nodeLibrarySourceRoot = Path.Combine(repoRoot, "shared", "NodeLibrary", "Nodes");

        var l1FolderToType = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase);
        foreach (var l1Type in nodeL1CategoryTypes)
        {
            var l1Files = Directory.GetFiles(nodeLibrarySourceRoot, l1Type.Name + ".cs", SearchOption.AllDirectories);
            if (l1Files.Length == 0) continue;
            var l1Folder = Path.GetFileName(Path.GetDirectoryName(l1Files[0]));
            if (!string.IsNullOrEmpty(l1Folder))
            {
                l1FolderToType[l1Folder] = l1Type;
            }
        }

        var l2TypeToL1Type = new Dictionary<Type, Type>();
        foreach (var l2File in Directory.GetFiles(nodeLibrarySourceRoot, "*L2CategoryMetadata*.cs", SearchOption.AllDirectories))
        {
            var l2ClassName = Path.GetFileNameWithoutExtension(l2File);
            var l1Folder = Path.GetFileName(Path.GetDirectoryName(Path.GetDirectoryName(l2File)));
            var l2Type = nodeLibraryAssembly.GetTypes().FirstOrDefault(t => t.Name == l2ClassName);
            if (string.IsNullOrEmpty(l1Folder) || string.IsNullOrEmpty(l2ClassName) || l2Type == null) continue;
            if (l1FolderToType.TryGetValue(l1Folder, out var l1Type))
            {
                l2TypeToL1Type[l2Type] = l1Type;
            }
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

            // Get types with NodeL2CategoryMetadata attribute that belong to this L1 category
            var nodeL2CategoryTypes = nodeLibraryAssembly.GetTypes().Where(t =>
                                            t.GetCustomAttributes(typeof(NodeL2CategoryMetadataAttribute), inherit: false).Any() &&
                                            l2TypeToL1Type.TryGetValue(t, out var parentL1Type) &&
                                            parentL1Type == nodeL1CategoryType).ToList();

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
                    Img = nodeL2CategoryMetadata.Icon,
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
                    nodeL2Category.Actions.Add(new NodeMetadataModel
                    {
                        Type = nodeMetaData?.NodeType ?? "defaultNode",
                        Name = nodeType.Name,
                        Label = nodeDisplayName.DisplayName,
                        Description = nodeDescription.Description,
                        Icon = null,
                        Img = nodeMetaData?.Icon ?? "/function.png",
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

                    // Save node json to worc-platform repo
                    var nodeJsonFilePath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "clients", "web-apps", "apps", "studio", "src", "features", "dynamic-config-panel", "constants", "config-json", nodeType.Name + ".json"));
                    DeleteLegacyActivityJsonIfExists(nodeJsonFilePath, nodeType.Name);
                    WriteJsonToFile(nodeJsonFilePath, nodeJson, jsonSerializerOptions);

                    // Save the same file in LocalAppData/AvintraDesktopApp (if applicable)
                    if (OperatingSystem.IsWindows())
                    {
                        nodeJsonFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "AvintraDesktopApp", "config-files", "desktop-nodes", nodeType.Name + ".json");
                        DeleteLegacyActivityJsonIfExists(nodeJsonFilePath, nodeType.Name);
                        WriteJsonToFile(nodeJsonFilePath, nodeJson, jsonSerializerOptions);
                    }
                }

                // Add the level 2 category to the level 1 category
                nodeL1Category.ActionCategories.Add(nodeL2Category);
            }

            // Add the level 1 category to the mapping object
            nodeMappingObject.Add(nodeL1Category);
        }

        // Save _NodeSelectorData.json to the worc-platform repo. Merge with existing data so legacy categories are preserved.
        var nodeSelectorJsonFilePath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "clients", "web-apps", "apps", "studio", "src", "features", "action-selector", "constants", "_ActionSelectorData.json"));
        var mergedMappingObject = LoadAndMergeActionSelectorData(nodeSelectorJsonFilePath, nodeMappingObject, jsonSerializerOptions);
        WriteJsonToFile(nodeSelectorJsonFilePath, mergedMappingObject, jsonSerializerOptions, "Nodes mapping JSON saved to worc-platform repo");

        // Save same file _NodeSelectorData.json to LocalAppData/AvintraDesktopApp (if applicable). Merge with existing data so legacy categories are preserved.
        if (OperatingSystem.IsWindows())
        {
            nodeSelectorJsonFilePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "AvintraDesktopApp", "config-files", "action-selector", "_ActionSelectorData.json");
            WriteJsonToFile(nodeSelectorJsonFilePath, mergedMappingObject, jsonSerializerOptions, "Node selector mapping JSON saved to AppData/Local/AvintraDesktopApp");
        }

        // Temporary: Copy cloud connector config files from WorkspaceAPIs to LocalAppData and desktop-app release folder to bundle with the app until we move the cloud connectors from WorkspaceAPIs to NodeLibrary project.
        // TODO: If we keep this code, then refactor or optimize the file copying logic to support linux and windows os
        NodeToJsonHelper.CopyCloudConnectorConfigFiles();

        Console.WriteLine("Task complete");
    }

    // Helper method to merge generated L1/L2 categories into an existing _ActionSelectorData.json file.
    // Existing L1/L2 categories not present in NodeLibrary are preserved.
    static List<NodeL1CategoryModel> LoadAndMergeActionSelectorData(string filePath, List<NodeL1CategoryModel> generatedL1Categories, JsonSerializerOptions options)
    {
        List<NodeL1CategoryModel> existingL1Categories = [];
        if (File.Exists(filePath))
        {
            try
            {
                var existingJson = File.ReadAllText(filePath);
                existingL1Categories = JsonSerializer.Deserialize<List<NodeL1CategoryModel>>(existingJson, options) ?? [];
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Could not read existing action selector data from {filePath}. Starting fresh. Error: {ex.Message}");
            }
        }

        var mergedL1Categories = new List<NodeL1CategoryModel>();
        var processedGeneratedL1Labels = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var existingL1 in existingL1Categories)
        {
            var generatedL1 = generatedL1Categories.FirstOrDefault(g => string.Equals(g.Label, existingL1.Label, StringComparison.OrdinalIgnoreCase));
            if (generatedL1 == null)
            {
                mergedL1Categories.Add(existingL1);
                continue;
            }

            processedGeneratedL1Labels.Add(generatedL1.Label);

            var mergedL2Categories = new List<NodeL2CategoryModel>();
            var replacedL2Labels = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var existingL2 in existingL1.ActionCategories)
            {
                var generatedL2 = generatedL1.ActionCategories.FirstOrDefault(g => string.Equals(g.Label, existingL2.Label, StringComparison.OrdinalIgnoreCase));
                if (generatedL2 != null)
                {
                    mergedL2Categories.Add(generatedL2);
                    replacedL2Labels.Add(generatedL2.Label);
                }
                else
                {
                    mergedL2Categories.Add(existingL2);
                }
            }

            // Append any new L2 categories from NodeLibrary that did not exist in the current file
            foreach (var generatedL2 in generatedL1.ActionCategories)
            {
                if (!replacedL2Labels.Contains(generatedL2.Label))
                {
                    mergedL2Categories.Add(generatedL2);
                }
            }

            mergedL1Categories.Add(new NodeL1CategoryModel
            {
                Label = existingL1.Label,
                Description = existingL1.Description,
                Icon = existingL1.Icon,
                ActionCategories = mergedL2Categories,
            });
        }

        // Add any generated L1 categories that did not exist in the current file
        foreach (var generatedL1 in generatedL1Categories)
        {
            if (!processedGeneratedL1Labels.Contains(generatedL1.Label))
            {
                mergedL1Categories.Add(generatedL1);
            }
        }

        return mergedL1Categories;
    }

    // Helper method to delete the legacy Activity.json file when a NodeLibrary node has been migrated from Activity to Node naming.
    static void DeleteLegacyActivityJsonIfExists(string nodeJsonFilePath, string nodeTypeName)
    {
        if (!nodeTypeName.EndsWith("Node")) return;

        var activityFileName = nodeTypeName.Substring(0, nodeTypeName.Length - 4) + "Activity.json";
        var directory = Path.GetDirectoryName(nodeJsonFilePath);
        if (string.IsNullOrEmpty(directory)) return;

        var activityFilePath = Path.Combine(directory, activityFileName);
        if (File.Exists(activityFilePath))
        {
            File.Delete(activityFilePath);
            Console.WriteLine($"Deleted legacy activity config file: {activityFilePath}");
        }
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