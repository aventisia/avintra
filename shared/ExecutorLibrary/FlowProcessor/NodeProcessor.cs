using System.Collections.Concurrent;
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

    public Task<NodeExecutionResult> ExecuteAsync(
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

            // 1. Resolve node class from the type cache. Replace suffix "Activity" with "Node" to get the BaseNode class name (e.g. "GenerateRandomNumberActivity" → "GenerateRandomNumberNode")
            // Need to remove the Activity from the last part of the name only, to support cases like "MyCustomActivityNode". This is only to support older flows that were created before we standardized on the "Node" suffix, and can be removed in the future once all flows have been updated to use the "Node" suffix.
            var nodeClassName = node.Data?.Name ?? string.Empty;
            nodeClassName = nodeClassName.EndsWith("Activity", StringComparison.OrdinalIgnoreCase)
                ? nodeClassName.Substring(0, nodeClassName.Length - "Activity".Length) + "Node"
                : nodeClassName;

            if (string.IsNullOrWhiteSpace(nodeClassName))
            {
                return Task.FromResult(CreateFailedResult(node.Id, nodeDisplayName, sw, "Node data is missing the 'Name' field (class name)."));
            }

            if (!NodeTypeCache.Value.TryGetValue(nodeClassName, out var nodeType))
            {
                return Task.FromResult(CreateFailedResult(node.Id, nodeDisplayName, sw, $"No BaseNode class found for '{nodeClassName}'. Ensure the node class exists in the NodeLibrary assembly."));
            }

            // 2. Create instance
            var baseNode = (BaseNode)Activator.CreateInstance(nodeType)!;

            // 3. Set base class required properties from context
            baseNode.AgentId = new InArgument<string>(context.Get<string>("AgentId") ?? string.Empty);
            baseNode.AgentName = new InArgument<string>(context.Get<string>("AgentName") ?? string.Empty);
            baseNode.AccessToken = new InArgument<string>(context.Get<string>("AccessToken") ?? string.Empty);
            baseNode.IsSuccess = new OutArgument<bool>();
            baseNode.StatusMessage = new OutArgument<string>();

            // 4. Map inputs from ReactFlow node data to InArgument properties
            var inputLogs = new List<NodeLogKeyValue>();
            if (node.Data?.Inputs is { Count: > 0 })
            {
                MapInputs(baseNode, nodeType, node.Data.Inputs, context, inputLogs);
            }

            // 5. Initialize any remaining OutArgument properties that are still null
            InitializeOutArguments(baseNode, nodeType);

            // 6. Execute the node
            var nodeContext = new NodeContext();
            baseNode.InternalExecute(nodeContext);

            sw.Stop();

            // 7. Collect outputs
            var outputValues = new Dictionary<string, object?>();
            var outputLogs = new List<NodeLogKeyValue>();
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

            return Task.FromResult(new NodeExecutionResult
            {
                IsSuccess = isSuccess,
                NodeLog = nodeLog,
                OutputValues = outputValues,
            });
        }
        catch (OperationCanceledException)
        {
            throw; // Let FlowProcessor handle cancellation
        }
        catch (Exception ex)
        {
            sw.Stop();
            return Task.FromResult(CreateFailedResult(node.Id, nodeDisplayName, sw, ex.Message));
        }
    }

    private static void MapInputs(
        BaseNode baseNode,
        Type nodeType,
        List<ReactFlowNodeInput> inputs,
        FlowExecutionContext context,
        List<NodeLogKeyValue> inputLogs)
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

            // Log the input
            inputLogs.Add(new NodeLogKeyValue
            {
                Key = input.Key,
                Value = NodeLogHelper.ConvertValueForLogging(input.Key, convertedValue ?? "null", "Input", false),
            });
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
        List<NodeLogKeyValue> outputLogs)
    {
        // Build a set of enabled output keys from the ReactFlow node data
        var enabledOutputKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (declaredOutputs is { Count: > 0 })
        {
            foreach (var output in declaredOutputs)
            {
                if (output.Value.Enabled && !string.IsNullOrWhiteSpace(output.Key))
                    enabledOutputKeys.Add(output.Key);
            }
        }

        var properties = nodeType.GetProperties(PropertyFlags);
        foreach (var property in properties)
        {
            if (!NodeArgumentHelper.IsOutArgument(property))
                continue;

            // Skip base class internal outputs
            if (string.Equals(property.Name, nameof(BaseNode.IsSuccess), StringComparison.OrdinalIgnoreCase) ||
                string.Equals(property.Name, nameof(BaseNode.StatusMessage), StringComparison.OrdinalIgnoreCase))
                continue;

            var argInstance = property.GetValue(baseNode);
            if (argInstance is null)
                continue;

            var value = NodeArgumentHelper.ReadArgumentValue(argInstance);

            // Always log the output
            outputLogs.Add(new NodeLogKeyValue
            {
                Key = property.Name,
                Value = NodeLogHelper.ConvertValueForLogging(property.Name, value ?? "null", "Output", false),
            });

            // Only add to flow context if output is enabled (or if no declared outputs exist, include all)
            if (enabledOutputKeys.Count == 0 || enabledOutputKeys.Contains(property.Name))
            {
                outputValues[property.Name] = value;
            }
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
            Outputs =
            [
                new NodeLogKeyValue { Key = "Error", Value = errorMessage }
            ],
        };

        return new NodeExecutionResult
        {
            IsSuccess = false,
            NodeLog = nodeLog,
            OutputValues = new Dictionary<string, object?>(),
        };
    }

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
