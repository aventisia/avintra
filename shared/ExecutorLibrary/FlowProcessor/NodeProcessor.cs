using System.Collections.Concurrent;
using System.ComponentModel;
using System.Diagnostics;
using System.Reflection;
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

        try
        {
            cancellationToken.ThrowIfCancellationRequested();

            // 1. Preprocess special node types (cloudConnectorNode, aiNode) — remaps inputs and resolves the correct class name
            var (preprocessedName, preprocessedInputs) = PreprocessNode(node, context);

            // Resolve node class from the type cache. Replace suffix "Activity" with "Node" to get the BaseNode class name (e.g. "GenerateRandomNumberActivity" → "GenerateRandomNumberNode")
            // Need to remove the Activity from the last part of the name only, to support cases like "MyCustomActivityNode". This is only to support older flows that were created before we standardized on the "Node" suffix, and can be removed in the future once all flows have been updated to use the "Node" suffix.
            var nodeClassName = preprocessedName;
            nodeClassName = nodeClassName.EndsWith("Activity", StringComparison.OrdinalIgnoreCase)
                ? nodeClassName.Substring(0, nodeClassName.Length - "Activity".Length) + "Node"
                : nodeClassName;

            if (string.IsNullOrWhiteSpace(nodeClassName))
            {
                return CreateFailedResult(node.Id, nodeDisplayName, sw, "Node data is missing the 'Name' field (class name).");
            }

            if (!NodeTypeCache.Value.TryGetValue(nodeClassName, out var nodeType))
            {
                return CreateFailedResult(node.Id, nodeDisplayName, sw, $"No BaseNode class found for '{nodeClassName}'. Ensure the node class exists in the NodeLibrary assembly.");
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
            var inputLogs = new Dictionary<string, string>();
            if (preprocessedInputs is { Count: > 0 })
            {
                MapInputs(baseNode, nodeType, preprocessedInputs, context, inputLogs);
            }

            // 5. Initialize any remaining OutArgument properties that are still null
            InitializeOutArguments(baseNode, nodeType);

            // 6. Execute the node
            var nodeContext = new NodeContext();
            await baseNode.InternalExecuteAsync(nodeContext);

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
            return CreateFailedResult(node.Id, nodeDisplayName, sw, ex.Message);
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

            // Create InArgument<T> with the value and set on the node
            var inArgument = NodeArgumentHelper.CreateInArgument(genericArgType, convertedValue);
            property.SetValue(baseNode, inArgument);

            // Log the input using DisplayName if available, otherwise property name
            var displayName = property.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName ?? input.Key;
            inputLogs[displayName] = NodeLogHelper.ConvertValueForLogging(displayName, convertedValue ?? "null", "Input", false);
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
                outputLogs["Status"] = NodeLogHelper.ConvertValueForLogging("Status", value, "Output", false);
                continue;
            }

            // Only include outputs that are enabled (or all if none are explicitly declared)
            if (enabledOutputKeys.Count > 0 && !enabledOutputKeys.Contains(property.Name))
                continue;

            // Determine log key: use output variable alias if available, otherwise property name
            var logKey = outputAliasMap.TryGetValue(property.Name, out var alias) ? alias : property.Name;

            // Log the output
            outputLogs[logKey] = NodeLogHelper.ConvertValueForLogging(logKey, value, "Output", false);

            // Add to flow context using the alias as the variable name
            var contextKey = outputAliasMap.TryGetValue(property.Name, out var ctxAlias) ? ctxAlias : property.Name;
            outputValues[contextKey] = value;
        }
    }

    private static NodeExecutionResult CreateFailedResult(string nodeId, string nodeDisplayName, Stopwatch sw, string errorMessage)
    {
        sw.Stop();
        var nodeLog = new NodeExecutionLog
        {
            NodeId = nodeId,
            NodeName = nodeDisplayName,
            NodeUniqueName = nodeId,
            IsSuccess = false,
            Duration = sw.Elapsed.TotalMilliseconds,
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
            "aiNode" => PreprocessAiNode(inputs, context),
            _ => (rawName, inputs),
        };
    }

    /// <summary>
    /// Transforms cloudConnectorNode inputs into (Provider, Action, CredentialId, Payload)
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

            if (input.Key.Contains("__CredentialId__"))
            {
                newInputs.Add(new ReactFlowNodeInput { Key = "CredentialId", Value = input.Value });
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
    private static (string, List<ReactFlowNodeInput>) PreprocessAiNode(List<ReactFlowNodeInput> inputs, FlowExecutionContext context)
    {
        var newInputs = new List<ReactFlowNodeInput>();

        foreach (var input in inputs)
        {
            if (string.IsNullOrEmpty(input.Value?.ToString())) continue;
            if (IsSystemInput(input.Key)) continue;

            var key = input.Key switch
            {
                var k when k.Contains("__ModelConfig__") => "ModelConfig",
                var k when k.Contains("__Prompt__") => "Prompt",
                var k when k.Contains("__KbConfig__") => "KbConfig",
                var k when k.Contains("__MemoryConfig__") => "MemoryConfig",
                var k when k.Contains("__ToolsConfig__") => "ToolsConfig",
                var k when k.Contains("__Files__") => "Files",
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

        return ("ProcessLLMRequestNode", newInputs);
    }

    private static bool IsSystemInput(string key) =>
        key.Equals("FlowMetadata", StringComparison.OrdinalIgnoreCase) ||
        key.Equals("JobContext", StringComparison.OrdinalIgnoreCase) ||
        key.Equals("CallerContext", StringComparison.OrdinalIgnoreCase);

    private static ConcurrentDictionary<string, Type> BuildNodeTypeCache()
    {
        var cache = new ConcurrentDictionary<string, Type>(StringComparer.OrdinalIgnoreCase);

        var assembly = Assembly.Load("NodeLibrary");
        var baseNodeType = typeof(BaseNode);

        var nodeTypes = assembly.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && baseNodeType.IsAssignableFrom(t));

        foreach (var type in nodeTypes)
        {
            cache.TryAdd(type.Name, type);
        }

        return cache;
    }
}
