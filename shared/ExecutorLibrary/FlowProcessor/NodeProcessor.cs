using System.Collections.Concurrent;
using System.ComponentModel;
using System.Diagnostics;
using System.Reflection;
using System.Security;
using ExecutorLibrary.Helpers;
using NodeLibrary.Core;
using NodeLibrary.Helpers;

namespace ExecutorLibrary.FlowProcessor;

public class NodeProcessor : INodeProcessor
{
    private static readonly BindingFlags PropertyFlags =
        BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase;

    /// <summary>
    /// Lazily built cache of BaseNode class name → Type.
    /// Thread-safe and shared across all NodeProcessor instances.
    /// </summary>
    private static readonly Lazy<ConcurrentDictionary<string, Type>> NodeTypeCache = new(BuildNodeTypeCache);

    public async Task<NodeExecutionResult> ExecuteAsync(
        ReactFlowNodeModel node,
        FlowExecutionContext context,
        CancellationToken cancellationToken = default)
    {
        var sw = Stopwatch.StartNew();
        var nodeDisplayName = string.IsNullOrWhiteSpace(node.Data?.Label)
            ? node.Type
            : node.Data.Label;

        var nodeClassName = string.Empty;
        var inputLogs = new Dictionary<string, string>();

        try
        {
            cancellationToken.ThrowIfCancellationRequested();

            var debugLogPath = Path.Combine(Path.GetTempPath(), "NodeProcessor_debug.log");
            void DebugLog(string message)
            {
                try
                {
                    File.AppendAllText(debugLogPath, $"{DateTimeOffset.Now:HH:mm:ss.fff} [NodeProcessor] {message}{Environment.NewLine}");
                }
                catch { /* best-effort */ }
            }

            // 1. Preprocess special node types (cloudConnectorNode, aiNode) — remaps inputs and resolves the correct class name
            var (preprocessedName, preprocessedInputs) = PreprocessNode(node, context);
            DebugLog($"Preprocessed node name: {preprocessedName}");

            // Resolve node class from the type cache. Replace suffix "Activity" with "Node" to get the BaseNode class name (e.g. "GenerateRandomNumberActivity" → "GenerateRandomNumberNode")
            // Need to remove the Activity from the last part of the name only, to support cases like "MyCustomActivityNode". This is only to support older flows that were created before we standardized on the "Node" suffix, and can be removed in the future once all flows have been updated to use the "Node" suffix.
            nodeClassName = preprocessedName;
            nodeClassName = nodeClassName.EndsWith("Activity", StringComparison.OrdinalIgnoreCase)
                ? nodeClassName.Substring(0, nodeClassName.Length - "Activity".Length) + "Node"
                : nodeClassName;

            if (string.IsNullOrWhiteSpace(nodeClassName))
            {
                return CreateFailedResult(node.Id, nodeDisplayName, nodeClassName, sw, "Node data is missing the 'Name' field (class name).");
            }

            if (!NodeTypeCache.Value.TryGetValue(nodeClassName, out var nodeType))
            {
                return CreateFailedResult(node.Id, nodeDisplayName, nodeClassName, sw, $"No BaseNode class found for '{nodeClassName}'. Ensure the node class exists in a NodeLibrary.* assembly.");
            }

            // 2. Create instance
            var baseNode = (BaseNode)Activator.CreateInstance(nodeType)!;

            // 3. Set base class required properties from context
            baseNode.FlowMetadata = new InArgument<FlowMetadata>(context.Get<FlowMetadata>("_agent") ?? new FlowMetadata());
            baseNode.JobContext = new InArgument<JobContext>(context.Get<JobContext>("_job") ?? new JobContext());
            baseNode.CallerContext = new InArgument<CallerContext>(context.Get<CallerContext>("_caller") ?? new CallerContext());
            baseNode.IsSuccess = new OutArgument<bool>();
            baseNode.StatusMessage = new OutArgument<string>();

            // 4. Map inputs from ReactFlow node data to InArgument properties
            inputLogs = new Dictionary<string, string>();
            DebugLog($"About to map {preprocessedInputs?.Count ?? 0} inputs for {nodeClassName}");
            if (preprocessedInputs is { Count: > 0 })
            {
                MapInputs(baseNode, nodeType, preprocessedInputs, context, inputLogs);
            }
            DebugLog($"Mapped inputs for {nodeClassName}. Keys: {string.Join(", ", inputLogs.Keys)}");

            // 5. Initialize any remaining OutArgument properties that are still null
            InitializeOutArguments(baseNode, nodeType);
            DebugLog($"Initialized out arguments for {nodeClassName}");

            // Reset runtime-declared outputs from any previous execution (defensive, instances are normally fresh)
            baseNode.DynamicOutputs.Clear();

            // 6. Execute the node
            var nodeContext = new NodeContext();
            DebugLog($"Calling InternalExecuteAsync on {nodeClassName}");
            await baseNode.InternalExecuteAsync(nodeContext);
            DebugLog($"InternalExecuteAsync completed on {nodeClassName}");

            sw.Stop();

            // 7. Collect outputs
            var outputValues = new Dictionary<string, object?>();
            var outputLogs = new Dictionary<string, string>();
            CollectOutputs(baseNode, nodeType, node.Data?.Outputs, outputValues, outputLogs);

            // 8. Read IsSuccess
            var isSuccess = baseNode.IsSuccess.Value is bool b ? b : true;

            // 9. Build result
            var nodeLog = new NodeExecutionLog
            {
                UniqueNodeId = Guid.NewGuid().ToString(),
                NodeId = node.Id,
                NodeName = nodeDisplayName,
                NodeUniqueName = nodeClassName,
                IsSuccess = isSuccess,
                Duration = sw.Elapsed.TotalMilliseconds,
                Inputs = inputLogs,
                Outputs = outputLogs,
            };

            return new NodeExecutionResult
            {
                IsSuccess = isSuccess,
                NodeLog = nodeLog,
                OutputValues = outputValues,
            };
        }
        catch (OperationCanceledException)
        {
            throw; // Let FlowProcessor handle cancellation
        }
        catch (Exception ex)
        {
            sw.Stop();
            var errorMessage = ex.InnerException is not null
                ? $"{ex.Message} | Inner: {ex.InnerException.GetType().Name}: {ex.InnerException.Message}"
                : ex.Message;
            return CreateFailedResult(node.Id, nodeDisplayName, nodeClassName, sw, errorMessage, inputLogs);
        }
    }

    private static void MapInputs(
        BaseNode baseNode,
        Type nodeType,
        List<ReactFlowNodeInput> inputs,
        FlowExecutionContext context,
        Dictionary<string, string> inputLogs)
    {
        foreach (var input in inputs)
        {
            if (string.IsNullOrWhiteSpace(input.Key))
                continue;

            var property = nodeType.GetProperty(input.Key, PropertyFlags);
            if (property is null || !NodeArgumentHelper.IsInArgument(property))
                continue;

            var genericArgType = NodeArgumentHelper.GetGenericArgumentType(property);
            if (genericArgType is null)
                continue;

            // Resolve template variables (e.g., {{RandomNumber}})
            var resolvedValue = context.ResolveTemplateObject(input.Value);

            // Convert to target type
            var convertedValue = NodeArgumentHelper.ConvertToType(resolvedValue, genericArgType);

            // Skip empty optional SecureString inputs entirely — don't map or log them so
            // unused password fields (e.g. Excel Read/Write Protection) don't clutter the
            // execution inputs list.
            if (convertedValue is SecureString ss && ss.Length == 0)
                continue;

            // Create InArgument<T> with the value and set on the node
            var inArgument = NodeArgumentHelper.CreateInArgument(genericArgType, convertedValue);
            property.SetValue(baseNode, inArgument);

            // Log the input using DisplayName if available, otherwise property name
            var displayName = property.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName ?? input.Key;
            inputLogs[displayName] = NodeLogHelper.ConvertValueForLogging(displayName, convertedValue ?? "null", "Input");
        }
    }

    private static void InitializeOutArguments(BaseNode baseNode, Type nodeType)
    {
        var properties = nodeType.GetProperties(PropertyFlags);
        foreach (var property in properties)
        {
            if (!NodeArgumentHelper.IsOutArgument(property))
                continue;

            // Skip if already initialized (e.g. IsSuccess, StatusMessage set earlier)
            if (property.GetValue(baseNode) is not null)
                continue;

            var genericArgType = NodeArgumentHelper.GetGenericArgumentType(property);
            if (genericArgType is null)
                continue;

            var outArg = NodeArgumentHelper.CreateOutArgument(genericArgType);
            property.SetValue(baseNode, outArg);
        }
    }

    private static void CollectOutputs(
        BaseNode baseNode,
        Type nodeType,
        List<ReactFlowNodeOutput>? declaredOutputs,
        Dictionary<string, object?> outputValues,
        Dictionary<string, string> outputLogs)
    {
        // Build lookup: property name → output variable alias (from ReactFlowNodeOutput.Value.Value)
        // and set of enabled output keys
        var enabledOutputKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var outputAliasMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (declaredOutputs is { Count: > 0 })
        {
            foreach (var output in declaredOutputs)
            {
                if (string.IsNullOrWhiteSpace(output.Key))
                    continue;

                if (output.Value.Enabled)
                    enabledOutputKeys.Add(output.Key);

                // The output variable alias is stored in Value.Value (e.g. "{{RandomNumber}}" → "RandomNumber")
                var alias = output.Value.Value?.Replace("{{", "").Replace("}}", "").Trim();
                if (!string.IsNullOrWhiteSpace(alias))
                    outputAliasMap[output.Key] = alias;
            }
        }

        var properties = nodeType.GetProperties(PropertyFlags);
        foreach (var property in properties)
        {
            if (!NodeArgumentHelper.IsOutArgument(property))
                continue;

            // Skip IsSuccess — it's tracked separately on NodeExecutionLog.IsSuccess
            if (string.Equals(property.Name, nameof(BaseNode.IsSuccess), StringComparison.OrdinalIgnoreCase))
                continue;

            var argInstance = property.GetValue(baseNode);
            if (argInstance is null)
                continue;

            var value = NodeArgumentHelper.ReadArgumentValue(argInstance);

            // Skip outputs with null values (e.g. disabled conditional outputs like RandomNumbers when single mode)
            if (value is null)
                continue;

            // StatusMessage is logged as "Status" to match the legacy format
            if (string.Equals(property.Name, nameof(BaseNode.StatusMessage), StringComparison.OrdinalIgnoreCase))
            {
                outputLogs["Status"] = NodeLogHelper.ConvertValueForLogging("Status", value, "Output");
                continue;
            }

            // Only include outputs that are enabled (or all if none are explicitly declared)
            if (enabledOutputKeys.Count > 0 && !enabledOutputKeys.Contains(property.Name))
                continue;

            // Determine log key: use output variable alias if available, otherwise property name
            var logKey = outputAliasMap.TryGetValue(property.Name, out var alias) ? alias : property.Name;

            // Log the output
            outputLogs[logKey] = NodeLogHelper.ConvertValueForLogging(logKey, value, "Output");

            // Add to flow context using the alias as the variable name
            var contextKey = outputAliasMap.TryGetValue(property.Name, out var ctxAlias) ? ctxAlias : property.Name;
            outputValues[contextKey] = value;
        }

        // Merge any runtime-declared outputs produced by the node (e.g. SetVariableNode).
        // These are not declared as OutArgument<T> properties, so they are not subject
        // to the enabled-output filter or alias map.
        if (baseNode.DynamicOutputs is { Count: > 0 } dynamicOutputs)
        {
            foreach (var kv in dynamicOutputs)
            {
                if (kv.Value is null)
                    continue;

                var logKey = kv.Key;
                outputLogs[logKey] = NodeLogHelper.ConvertValueForLogging(logKey, kv.Value, "Output");
                outputValues[logKey] = kv.Value;
            }
        }
    }

    private static NodeExecutionResult CreateFailedResult(
        string nodeId,
        string nodeDisplayName,
        string? nodeUniqueName,
        Stopwatch sw,
        string errorMessage,
        Dictionary<string, string>? inputLogs = null)
    {
        sw.Stop();
        var nodeLog = new NodeExecutionLog
        {
            UniqueNodeId = Guid.NewGuid().ToString(),
            NodeId = nodeId,
            NodeName = nodeDisplayName,
            NodeUniqueName = nodeUniqueName ?? nodeId,
            IsSuccess = false,
            Duration = sw.Elapsed.TotalMilliseconds,
            Inputs = inputLogs ?? new Dictionary<string, string>(),
            Outputs = new Dictionary<string, string>
            {
                ["Status"] = $"Node execution has failed: {errorMessage}"
            },
        };

        return new NodeExecutionResult
        {
            IsSuccess = false,
            NodeLog = nodeLog,
            OutputValues = new Dictionary<string, object?>(),
        };
    }

    // -------------------------------------------------------------------------
    // Node preprocessing — mirrors ActivityExecutorService.ConvertNodeData
    // -------------------------------------------------------------------------

    /// <summary>
    /// For special node types (cloudConnectorNode, aiNode), transforms the raw
    /// ReactFlow inputs into the shape expected by the corresponding BaseNode
    /// implementation and returns the resolved class name.
    /// For all other types, the node name and inputs are returned unchanged.
    /// </summary>
    private static (string resolvedClassName, List<ReactFlowNodeInput> inputs) PreprocessNode(
        ReactFlowNodeModel node,
        FlowExecutionContext context)
    {
        var rawName = node.Data?.Name ?? string.Empty;
        var inputs = node.Data?.Inputs ?? [];

        return node.Type switch
        {
            "cloudConnectorNode" => PreprocessCloudConnectorNode(rawName, inputs, context),
            "aiNode" => PreprocessAiNode(rawName, inputs, context),
            _ => (rawName, inputs),
        };
    }

    /// <summary>
    /// Transforms cloudConnectorNode inputs into (Provider, Action, CredentialName, Payload)
    /// and routes execution to ProcessConnectorRequestNode.
    /// </summary>
    private static (string, List<ReactFlowNodeInput>) PreprocessCloudConnectorNode(
        string rawName,
        List<ReactFlowNodeInput> inputs,
        FlowExecutionContext context)
    {
        // rawName format: "{provider}/{actionConnector}" e.g. "Google/SendEmailConnector"
        var segments = rawName.Split('/');
        var provider = string.Join("/", segments.Take(segments.Length - 1));
        var action = segments.Last();
        if (action.EndsWith("Connector", StringComparison.OrdinalIgnoreCase))
            action = action[..^"Connector".Length];

        var newInputs = new List<ReactFlowNodeInput>
        {
            new() { Key = "Provider", Value = provider },
            new() { Key = "Action", Value = action },
        };

        var payloadDict = new Dictionary<string, object?>();

        foreach (var input in inputs)
        {
            if (string.IsNullOrEmpty(input.Value?.ToString())) continue;
            if (IsSystemInput(input.Key)) continue;

            if (input.Key.Contains("__CredentialName__"))
            {
                newInputs.Add(new ReactFlowNodeInput { Key = "CredentialName", Value = input.Value });
                continue;
            }

            // Resolve any template variables before embedding into the payload JSON
            var resolvedValue = context.ResolveTemplateObject(input.Value);
            payloadDict[input.Key] = resolvedValue;
        }

        newInputs.Add(new ReactFlowNodeInput
        {
            Key = "Payload",
            Value = JsonSerializer.Serialize(payloadDict)
        });

        return ("ProcessConnectorRequestNode", newInputs);
    }

    /// <summary>
    /// Remaps aiNode's double-underscore-delimited keys (e.g. __ModelConfig__) to
    /// the property names expected by ProcessLLMRequestNode.
    /// When the flow is triggered by a chat interaction, automatically injects
    /// ChatUserInput and ChatThreadMessages from the flow execution context.
    /// </summary>
    private static (string, List<ReactFlowNodeInput>) PreprocessAiNode(string rawName, List<ReactFlowNodeInput> inputs, FlowExecutionContext context)
    {
        var newInputs = new List<ReactFlowNodeInput>();

        foreach (var input in inputs)
        {
            if (string.IsNullOrEmpty(input.Value?.ToString())) continue;
            if (IsSystemInput(input.Key)) continue;

            var key = input.Key switch
            {
                var k when k.Contains("__ModelConfig__") => "ModelConfig",
                var k when k.Contains("__VoiceConfig__") => "VoiceConfig",
                var k when k.Contains("__Prompt__") => "Prompt",
                var k when k.Contains("__KbConfig__") => "KbConfig",
                var k when k.Contains("__SkillsConfig__") => "SkillsConfig",
                var k when k.Contains("__MemoryConfig__") => "MemoryConfig",
                var k when k.Contains("__ToolsConfig__") => "ToolsConfig",
                var k when k.Contains("__RecommendedActionsConfig__") => "RecommendedActionsConfig",
                _ => input.Key,
            };

            newInputs.Add(new ReactFlowNodeInput { Key = key, Value = input.Value });
        }

        // Auto-inject chat variables when flow is triggered by a chat interaction
        if (context.TryGet<string>("TriggeredBy", out var triggeredBy) &&
            string.Equals(triggeredBy, "chat", StringComparison.OrdinalIgnoreCase))
        {
            if (context.TryGet<string>("ChatThreadMessages", out var threadMessages) && !string.IsNullOrWhiteSpace(threadMessages))
            {
                newInputs.Add(new ReactFlowNodeInput { Key = "ThreadMessages", Value = threadMessages });
            }

            if (context.TryGet<string>("ChatUserInput", out var userInput) && !string.IsNullOrWhiteSpace(userInput))
            {
                newInputs.Add(new ReactFlowNodeInput { Key = "UserInput", Value = userInput });
            }
        }
        if (rawName == "CreateTTSAIAgent")
        {
            return ("ProcessTTSRequestNode", newInputs);
        }
        else if (rawName == "CreateSTTAIAgent")
        {
            return ("ProcessTTSRequestNode", newInputs);
        }
        else
            return ("ProcessLLMRequestNode", newInputs);
    }

    private static bool IsSystemInput(string key) =>
        key.Equals("FlowMetadata", StringComparison.OrdinalIgnoreCase) ||
        key.Equals("JobContext", StringComparison.OrdinalIgnoreCase) ||
        key.Equals("CallerContext", StringComparison.OrdinalIgnoreCase);

    private static ConcurrentDictionary<string, Type> BuildNodeTypeCache()
    {
        var cache = new ConcurrentDictionary<string, Type>(StringComparer.OrdinalIgnoreCase);
        var baseNodeType = typeof(BaseNode);

        var candidateAssemblies = AppDomain.CurrentDomain.GetAssemblies()
            .Where(a => a.GetName().Name?.StartsWith("NodeLibrary", StringComparison.OrdinalIgnoreCase) == true)
            .ToList();

        // Self-contained, non-single-file publishes place dependency assemblies next to
        // the executable, but .NET only loads them into the AppDomain on first use. We
        // eagerly load any NodeLibrary.* assemblies from the app base directory so the
        // static type cache is complete before any flow executes.
        var baseDir = AppContext.BaseDirectory;
        if (!string.IsNullOrEmpty(baseDir) && Directory.Exists(baseDir))
        {
            foreach (var dllPath in Directory.GetFiles(baseDir, "NodeLibrary.*.dll"))
            {
                try
                {
                    var asmName = Path.GetFileNameWithoutExtension(dllPath);
                    if (candidateAssemblies.Exists(a =>
                        string.Equals(a.GetName().Name, asmName, StringComparison.OrdinalIgnoreCase)))
                    {
                        continue;
                    }

                    candidateAssemblies.Add(Assembly.LoadFrom(dllPath));
                }
                catch
                {
                    // Best-effort: ignore assemblies that cannot be loaded.
                }
            }
        }

        foreach (var assembly in candidateAssemblies)
        {
            try
            {
                var nodeTypes = assembly.GetTypes()
                    .Where(t => t.IsClass && !t.IsAbstract && baseNodeType.IsAssignableFrom(t));

                foreach (var type in nodeTypes)
                {
                    cache.TryAdd(type.Name, type);
                }
            }
            catch (ReflectionTypeLoadException)
            {
                // Best-effort: ignore assemblies that cannot fully load types.
            }
        }

        return cache;
    }
}
