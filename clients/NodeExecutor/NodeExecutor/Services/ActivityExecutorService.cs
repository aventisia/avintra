using CodeActivitiesLibrary.AppIntegrations.CloudConnectorsActivities;
using CodeActivitiesLibrary.Models;
using CodeActivitiesLibrary.Utils;
using DocumentFormat.OpenXml.Wordprocessing;
using DynamicExpresso;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NodeExecutor.Models;
using System;
using System.Activities;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;

namespace NodeExecutor.Services
{
    public static class ActivityExecutorService
    {
        public static ActivityNodeData ConvertNodeData(
            string agentId,
            string agentName,
            string accessToken,
            string stringNodeData,
            ExecutionContext executionContext,
            Interpreter interpreter)
        {
            // If the input string is null or empty, throw an exception
            if (string.IsNullOrEmpty(stringNodeData))
            {
                throw new ArgumentNullException(nameof(stringNodeData), "Input JSON string cannot be null or empty.");
            }

            // Attempt to deserialize the JSON string to ActivityNodeData
            try
            {
                var nodeData = JsonConvert.DeserializeObject<ActivityNodeData>(stringNodeData);

                // if nodeData null throw exception
                if (nodeData == null)
                {
                    throw new InvalidOperationException("Deserialized ActivityNodeData is null.");
                }

                // If node Type is CloundConnector then convert inputs accordingly
                if (nodeData.Type == "cloudConnectorNode")
                {
                    // Process nodeData's inputs to convert them for cloudConnectorNode
                    var newNodeInputs = new List<NodeInput>();
                    var connectorRequestPayload = new Dictionary<string, string>();
                    foreach (var input in nodeData.NodeInputs)
                    {
                        // If input is null or empty, skip
                        if (string.IsNullOrEmpty(input.Value?.ToString())) continue;

                        // if input key is agentId, agentName, accessToken then skip
                        if (input.Key.Equals("AgentId", StringComparison.OrdinalIgnoreCase) ||
                            input.Key.Equals("AgentName", StringComparison.OrdinalIgnoreCase) ||
                            input.Key.Equals("AccessToken", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        // If input key contains "__Credential__", then add directly to newNodeInputs
                        if (input.Key.Contains("__CredentialId__"))
                        {
                            // Split the action unique name
                            var actionNameSegments = nodeData.CodeActivityName.Split('/');
                            var providerName = string.Join("/", actionNameSegments.Take(actionNameSegments.Length - 1));
                            var actionName = actionNameSegments.Last();

                            // Remove Connector suffix from action name
                            if (actionName.EndsWith("Connector", StringComparison.OrdinalIgnoreCase))
                            {
                                actionName = actionName.Substring(0, actionName.Length - "Connector".Length);
                            }

                            // Add cloud provider
                            newNodeInputs.Add(new NodeInput { Key = "Provider", Value = providerName });

                            // Add connector's unqiue idenitifier (Can be added outside the foreach loop but just of the property sequence adding it here)
                            newNodeInputs.Add(new NodeInput { Key = "Action", Value = actionName });

                            // Add credentail id
                            newNodeInputs.Add(new NodeInput { Key = "CredentialId", Value = input.Value });
                            continue;
                        }

                        // Resolve template if input is string and contains {{ }}
                        object inputValue = input.Value;
                        if (input.Value is string strVal && strVal.Contains("{{") && strVal.Contains("}}"))
                        {
                            inputValue = ResolveTemplate(strVal, executionContext, interpreter);
                        }

                        // Convert the input value to string
                        object convertedValue = ConvertArgument(inputValue, typeof(string));

                        // Add to cloud connector's request payload
                        connectorRequestPayload[input.Key] = convertedValue?.ToString();
                    }

                    // Add connectorRequestPayload as JSON string to newNodeInputs
                    newNodeInputs.Add(new NodeInput { Key = "Payload", Value = JsonConvert.SerializeObject(connectorRequestPayload) });

                    // Update nodeData
                    nodeData.NodeInputs = newNodeInputs;
                    nodeData.CodeActivityName = nameof(ProcessConnectorRequestActivity);
                }

                // If node Type is aiNode then convert inputs accordingly
                if (nodeData.Type == "aiNode")
                {
                    // Process nodeData's inputs to convert them for aiNode
                    var newNodeInputs = new List<NodeInput>();
                    foreach (var input in nodeData.NodeInputs)
                    {
                        // If input is null or empty, skip
                        if (string.IsNullOrEmpty(input.Value?.ToString())) continue;

                        // if input key is agentId, agentName, accessToken then skip
                        if (input.Key.Equals("AgentId", StringComparison.OrdinalIgnoreCase) ||
                            input.Key.Equals("AgentName", StringComparison.OrdinalIgnoreCase) ||
                            input.Key.Equals("AccessToken", StringComparison.OrdinalIgnoreCase))
                        {
                            continue;
                        }

                        // ModelConfig
                        if (input.Key.Contains("__ModelConfig__"))
                        {
                            input.Key = "ModelConfig";
                            input.Value = JToken.Parse(input.Value.ToString());
                        }

                        // Prompt
                        if (input.Key.Contains("__Prompt__"))
                        {
                            input.Key = "Prompt";
                        }

                        // KbConfig
                        if (input.Key.Contains("__KbConfig__"))
                        {
                            input.Key = "KbConfig";
                            input.Value = JToken.Parse(input.Value.ToString());
                        }

                        // MemoryConfig
                        if (input.Key.Contains("__MemoryConfig__"))
                        {
                            input.Key = "MemoryConfig";
                            input.Value = JToken.Parse(input.Value.ToString());
                        }

                        // ToolsConfig
                        if (input.Key.Contains("__ToolsConfig__"))
                        {
                            input.Key = "ToolsConfig";
                            input.Value = JToken.Parse(input.Value.ToString());
                        }

                        // RecommendedActionsConfig
                        if (input.Key.Contains("__RecommendedActionsConfig__"))
                        {
                            input.Key = "RecommendedActionsConfig";
                            input.Value = JToken.Parse(input.Value.ToString());
                        }

                        // Resolve template if input is string and contains {{ }}
                        object inputValue = input.Value;
                        if (input.Value is string strVal && strVal.Contains("{{") && strVal.Contains("}}"))
                        {
                            inputValue = ResolveTemplate(strVal, executionContext, interpreter);
                        }

                        // Convert the input value to string
                        object convertedValue = ConvertArgument(inputValue, typeof(string));

                        // Add to newNodeInputs
                        newNodeInputs.Add(new NodeInput { Key = input.Key, Value = convertedValue?.ToString() });
                    }

                    // Update nodeData
                    nodeData.NodeInputs = newNodeInputs;
                    nodeData.CodeActivityName = nameof(ProcessLLMRequestActivity);
                }

                // Add agentId, agentName, accessToken as NodeInputs at the beginning
                nodeData.NodeInputs.Insert(0, new NodeInput { Key = "AccessToken", Value = accessToken });
                nodeData.NodeInputs.Insert(0, new NodeInput { Key = "AgentName", Value = agentName });
                nodeData.NodeInputs.Insert(0, new NodeInput { Key = "AgentId", Value = agentId });

                // Return the modified nodeData
                return nodeData;
            }
            catch (JsonException jsonEx)
            {
                throw new InvalidOperationException("Failed to deserialize JSON string to ActivityNodeData.", jsonEx);
            }
        }

        private static object GetCodeActivityInstance(string codeActivityName)
        {
            try
            {
                // Force-load the assembly by name
                var codeActivitiesAssembly = AppDomain.CurrentDomain.GetAssemblies()
                    .FirstOrDefault(a => a.GetName().Name == "CodeActivitiesLibrary");

                if (codeActivitiesAssembly == null)
                {
                    // Load manually if not already loaded
                    codeActivitiesAssembly = Assembly.Load("CodeActivitiesLibrary");
                }

                var activityType = codeActivitiesAssembly
                                        .GetTypes()
                                        .FirstOrDefault(w =>
                                            w.IsClass &&
                                            !w.IsAbstract &&
                                            typeof(Activity).IsAssignableFrom(w) &&
                                            string.Equals(w.Name, codeActivityName, StringComparison.OrdinalIgnoreCase));

                // Activity not found
                if (activityType == null)
                    throw new InvalidOperationException($"No CodeActivity class found for: {codeActivityName}");

                // Create and return an instance of the activity type
                return Activator.CreateInstance(activityType);
            }

            catch (Exception ex)
            {
                Console.WriteLine($"Error in finding CodeActivity {codeActivityName}: {ex.Message}");
                throw;
            }
        }

        public static (bool, NodeExecutionLog) SetupExecutionContext(ActivityNodeData nodeData, ExecutionContext executionContext, Interpreter interpreter, DateTime startTime)
        {
            // Initiaze the return object
            var nodeExecutionlog = new NodeExecutionLog
            {
                NodeExecutionId = Guid.NewGuid().ToString(),
                RetryAttempt = 0,
                NodeId = nodeData.Id,
                NodeName = nodeData.NodeName,
                NodeUniqueName = nodeData.CodeActivityName,
                IsSuccess = false,
                Duration = 0,
                Inputs = new List<NodeLogKeyValue>(),
                Outputs = new List<NodeLogKeyValue>()
            };

            // Initialize input and output dictionaries
            var inputValues = new Dictionary<string, object>();
            var outputValues = new Dictionary<string, object>();

            // Execute the node
            try
            {
                // Process node inputs
                foreach (var input in nodeData.NodeInputs)
                {
                    // If input is null or empty, skip
                    if (string.IsNullOrEmpty(input.Value?.ToString())) continue;

                    // Resolve template if input is string and contains {{ }}
                    object inputValue = input.Value;
                    if (input.Value is string strVal && strVal.Contains("{{") && strVal.Contains("}}"))
                    {
                        inputValue = ResolveTemplate(strVal, executionContext, interpreter);
                    }

                    // Add to inputValues for logging
                    if (!string.IsNullOrEmpty(input.Key) && 
                        !inputValues.ContainsKey(input.Key) && 
                        input.Key != "AgentId" &&
                        input.Key != "AgentName" && 
                        input.Key != "AccessToken")
                    {
                        inputValues[input.Key] = inputValue;
                    }

                    // Set the input argument in the execution context
                    executionContext.Set(input.Key, inputValue);
                    interpreter.SetVariable(input.Key, inputValue);
                }

                // Set inputValues to nodeExecutionLog object
                nodeExecutionlog.Inputs = inputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Input", false) }).ToList();

                // Set isSuccess status
                nodeExecutionlog.IsSuccess = true; // SetupExecutionContext is always successful if it reaches this point
            }
            catch
            {
                nodeExecutionlog.IsSuccess = false;
            }

            // Update duration
            nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;

            // Return
            return (nodeExecutionlog.IsSuccess, nodeExecutionlog);
        }

        public static (bool, NodeExecutionLog) ExecuteNode(NodeExecutionLog nodeExecutionlog, ActivityNodeData nodeData, ExecutionContext executionContext, Interpreter interpreter)
        {
            // Initialize input and output dictionaries
            var inputValues = new Dictionary<string, object>();
            var outputValues = new Dictionary<string, object>();

            // Execute the node
            try
            {
                // Get Code activity instance
                var activityInstance = GetCodeActivityInstance(nodeData.CodeActivityName);

                // Get the type of the activity instance
                var activityType = activityInstance.GetType();

                // Process node inputs
                foreach (var input in nodeData.NodeInputs)
                {
                    // TODO: if input does not have value return (in case of optional fields. all activity optional arugments should have default value)
                    // We can check using reflaction if the property has a default value or not and throw error later
                    if (string.IsNullOrEmpty(input.Value?.ToString())) continue;

                    // Get the property info for the input key
                    var prop = activityType.GetProperty(input.Key, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (prop == null) continue;

                    // Get input label
                    var displayName = prop.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName;

                    // Check if the property is an Argument<T>
                    var propType = prop.PropertyType;
                    var genericType = propType.IsGenericType ? propType.GetGenericArguments()[0] : null;

                    // Resolve template if input is string and contains {{ }}
                    object inputValue = input.Value;
                    if (input.Value is string strVal && strVal.Contains("{{") && strVal.Contains("}}"))
                    {
                        inputValue = ResolveTemplate(strVal, executionContext, interpreter);
                    }

                    // Convert the input value to the appropriate type
                    object convertedValue = ConvertArgument(inputValue, genericType);

                    // Check if the property is an InArgument<T>
                    if (convertedValue != null && genericType != null)
                    {
                        var inArgGenericType = typeof(InArgument<>).MakeGenericType(genericType);

                        object inArgument;

                        bool isLiteralSafe =
                            genericType.IsValueType ||
                            genericType == typeof(string);

                        if (isLiteralSafe)
                        {
                            // OK to use Literal<T>
                            inArgument = Activator.CreateInstance(inArgGenericType, convertedValue);
                        }
                        else
                        {
                            var ctxParam = Expression.Parameter(typeof(ActivityContext), "ctx");
                            var valueObjConst = Expression.Constant(convertedValue, typeof(object));
                            var castExpr = Expression.Convert(valueObjConst, genericType);
                            var lambdaExpr = Expression.Lambda(
                                typeof(Func<,>).MakeGenericType(typeof(ActivityContext), genericType),
                                castExpr,
                                ctxParam
                            );
                            inArgument = Activator.CreateInstance(inArgGenericType, lambdaExpr);
                        }

                        prop.SetValue(activityInstance, inArgument);

                        // Add to inputValues for logging if displayName is not null or empty
                        if (!string.IsNullOrEmpty(displayName)) inputValues[displayName] = convertedValue;
                    }
                }

                // Set inputValues to nodeExecutionLog object
                nodeExecutionlog.Inputs.AddRange(inputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Input", false) }).ToList());

                // Execute the activity
                var outputs = WorkflowInvoker.Invoke((Activity)activityInstance);

                // Set isSuccess activity status
                nodeExecutionlog.IsSuccess = outputs != null && Convert.ToBoolean(outputs["IsSuccess"]);

                // Process node outputs
                foreach (var nodeOutput in nodeData.NodeOutputs)
                {
                    // Get the property info for the output key
                    var prop = activityType.GetProperty(nodeOutput.Key, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (prop == null) continue;

                    // Replace {{ and }} in node output key (if exits)
                    nodeOutput.Value.Value = nodeOutput.Value.Value.Replace("{{", "").Replace("}}", "");

                    // Trim the output key
                    nodeOutput.Value.Value = nodeOutput.Value.Value.Trim();

                    // Set the output value in the execution context
                    if (outputs != null && outputs.ContainsKey(nodeOutput.Key))
                    {
                        executionContext.Set(nodeOutput.Value.Value, outputs[nodeOutput.Key]);
                        interpreter.SetVariable(nodeOutput.Value.Value, outputs[nodeOutput.Key]);

                        // Add to outputValues for logging
                        outputValues[nodeOutput.Value.Value] = outputs[nodeOutput.Key];
                    }
                }

                // Set status message to outputValues
                if (outputs != null && outputs.ContainsKey("StatusMessage"))
                    outputValues["Status"] = outputs["StatusMessage"];
            }
            catch (Exception ex)
            {
                outputValues["Status"] = $"Node execution has failed: {ex.Message}";
            }

            // Update outputValues
            nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();

            // Return
            return (nodeExecutionlog.IsSuccess, nodeExecutionlog);
        }

        public static (bool, NodeExecutionLog) ExecuteCondition(string nodeId, string nodeName, List<List<UnresolvedConditionObj>> conditions, ExecutionContext executionContext, Interpreter interpreter, DateTime startTime)
        {
            // Initialize the return object
            var nodeExecutionlog = new NodeExecutionLog
            {
                NodeExecutionId = Guid.NewGuid().ToString(),
                RetryAttempt = 0,
                NodeId = nodeId,
                NodeName = nodeName,
                NodeUniqueName = "ConditionalBranchActivity",
                IsSuccess = false,
                Duration = 0,
                Inputs = new List<NodeLogKeyValue>(),
                Outputs = new List<NodeLogKeyValue>()
            };

            // Initialize input and output dictionaries
            var inputValues = new Dictionary<string, object>();
            var outputValues = new Dictionary<string, object>();

            // If conditions null or empty return false
            if (conditions == null || conditions.Count == 0)
            {
                outputValues["Status"] = "No conditions provided";
                nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();
                return (false, nodeExecutionlog);
            }

            // Check conditions
            try
            {
                // Get Code activity instance
                var activityInstance = GetCodeActivityInstance("ConditionalBranchActivity");
                var activityType = activityInstance.GetType();

                // Prepare the nested list of ResolvedConditionObj with resolved values
                var resolvedGroups = new List<List<ResolvedConditionObj>>();
                foreach (var group in conditions) // node.Conditions: IList<IList<ConditionGroup>>
                {
                    var resolvedGroup = new List<ResolvedConditionObj>();
                    foreach (var cond in group)
                    {
                        // Resolve the first value
                        var resolvedFirst = ResolveTemplate(cond.FirstValue, executionContext, interpreter);
                        if (resolvedFirst is string s1 && !cond.FirstValue.Trim().StartsWith("{{"))
                            resolvedFirst = InferType(s1);

                        // Resolve the second value
                        var resolvedSecond = ResolveTemplate(cond.SecondValue, executionContext, interpreter);
                        if (resolvedSecond is string s2 && !cond.SecondValue.Trim().StartsWith("{{"))
                            resolvedSecond = InferType(s2);

                        resolvedGroup.Add(new ResolvedConditionObj
                        {
                            FirstValue = resolvedFirst,
                            ComparisonOperator = cond.ComparisonOperator,
                            SecondValue = resolvedSecond
                        });
                    }
                    resolvedGroups.Add(resolvedGroup);
                }

                // Log conditions as inputs
                inputValues["Conditions"] = resolvedGroups;

                // Set inputValues to nodeExecutionLog object
                nodeExecutionlog.Inputs = inputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Input", false) }).ToList();

                // Set the Conditions property
                var prop = activityType.GetProperty("Conditions", BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                if (prop != null)
                {
                    var argType = typeof(InArgument<List<List<ResolvedConditionObj>>>);

                    // Build: ctx => resolvedGroups
                    var ctxParam = Expression.Parameter(typeof(ActivityContext), "ctx");
                    var valueExpr = Expression.Constant(resolvedGroups, typeof(List<List<ResolvedConditionObj>>));
                    var lambda = Expression.Lambda(valueExpr, ctxParam);

                    var inArgument = Activator.CreateInstance(argType, lambda);
                    prop.SetValue(activityInstance, inArgument);
                }

                // Execute the branch condition
                var outputs = WorkflowInvoker.Invoke((Activity)activityInstance);

                // Set isSuccess activity status
                nodeExecutionlog.IsSuccess = outputs != null && Convert.ToBoolean(outputs["IsSuccess"]);

                // Directly return the ConditionResult output (do not set in execution context)
                if (outputs != null && outputs.ContainsKey("ConditionResult"))
                {
                    var result = outputs["ConditionResult"];
                    bool conditionResult = result is bool b ? b : false;

                    // Log the result
                    outputValues["ConditionsResult"] = conditionResult;
                    outputValues["Status"] = outputs["StatusMessage"];

                    // Update duration and outputValues
                    nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                    nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();

                    return (conditionResult, nodeExecutionlog);
                }

                // If no ConditionResult output, return false
                outputValues["Status"] = "Unknown error occurred while checking the condition";
                nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();
                return (false, nodeExecutionlog);
            }
            catch (Exception ex)
            {
                outputValues["Status"] = $"Error in ExecuteCondition: {ex.Message}";
                nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();
                return (false, nodeExecutionlog);
            }
        }

        public static (bool, NodeExecutionLog) MoveNextListItem(string nodeId, string nodeName, string listVarName, string currentItemVarName, string currentItemIndexVarName, ExecutionContext executionContext, Interpreter interpreter, DateTime startTime)
        {
            // Initialize the return object
            var nodeExecutionlog = new NodeExecutionLog
            {
                NodeExecutionId = Guid.NewGuid().ToString(),
                RetryAttempt = 0,
                NodeId = nodeId,
                NodeName = nodeName,
                NodeUniqueName = "LoopActivity",
                IsSuccess = false,
                Duration = 0,
                Inputs = new List<NodeLogKeyValue>(),
                Outputs = new List<NodeLogKeyValue>()
            };

            // Initialize input and output dictionaries
            var inputValues = new Dictionary<string, object>();
            var outputValues = new Dictionary<string, object>();

            // If listVarName or currentItemVarName is null or empty, return false
            if (string.IsNullOrEmpty(listVarName) || string.IsNullOrEmpty(currentItemVarName) || string.IsNullOrEmpty(currentItemIndexVarName) || executionContext == null || interpreter == null)
            {
                outputValues["Status"] = "Missing required parameters";
                nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();
                return (false, nodeExecutionlog);
            }

            try
            {
                // Resolve the list variable name in case it contains a template
                var resolvedListVar = ResolveTemplate(listVarName, executionContext, interpreter);

                // Set inputValues to nodeExecutionLog object
                inputValues["List"] = resolvedListVar;
                nodeExecutionlog.Inputs = inputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Input", false) }).ToList();

                // If resolvedListVar is a string, treat it as the key to look up in executionContext
                object listObj = resolvedListVar;
                if (resolvedListVar is string key)
                {
                    if (!executionContext.TryGet(key, out listObj) || listObj == null)
                    {
                        outputValues["Status"] = "List not found in execution context";
                        nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                        nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();
                        return (false, nodeExecutionlog);
                    }
                }

                // Try to cast to IEnumerable (but not string)
                IEnumerable enumerable;
                if (listObj is DataTable dt)
                    enumerable = dt.Rows;
                else if (listObj is DataRowCollection rowCollection)
                    enumerable = rowCollection;
                else if (listObj is IEnumerable en && !(listObj is string))
                    enumerable = en;
                else
                {
                    outputValues["Status"] = "List is not enumerable";
                    nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                    nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();
                    return (false, nodeExecutionlog);
                }

                // Convert to a list for indexing
                var items = enumerable.Cast<object>().ToList();
                if (items.Count == 0)
                {
                    outputValues["Status"] = "List is empty";
                    nodeExecutionlog.NodeName = $"{nodeName} (List is empty)";
                    nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                    nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();
                    nodeExecutionlog.IsSuccess = true; // List is empty so no error, just nothing to iterate over
                    return (false, nodeExecutionlog);
                }

                // Track current index in executionContext (use a hidden variable)
                string indexKey = $"__{listVarName}_CurrentIndex";
                int currentIndex = 0;
                if (executionContext.TryGet(indexKey, out var idxObj) && idxObj is int idx)
                    currentIndex = idx + 1; // Move to next item

                // Update the node name
                nodeExecutionlog.NodeName = $"{nodeName} ({currentIndex})";

                if (currentIndex >= items.Count)
                {
                    // Remove the hidden index variable
                    executionContext.Remove(indexKey);
                    outputValues["Status"] = "No more items in list";
                    nodeExecutionlog.NodeName = $"{nodeName} (Completed)";
                    nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                    nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();
                    nodeExecutionlog.IsSuccess = true; // Successfully reached the end of the list
                    return (false, nodeExecutionlog); // No more items
                }

                // Set current item and index in executionContext
                executionContext.Set(currentItemVarName, items[currentIndex]);
                executionContext.Set(currentItemIndexVarName, currentIndex); // Expose the current index to the user as well
                executionContext.Set(indexKey, currentIndex); // hidden/internal index
                interpreter.SetVariable(currentItemVarName, items[currentIndex]);
                interpreter.SetVariable(currentItemIndexVarName, currentIndex); // Expose the current index to the user as well
                interpreter.SetVariable(indexKey, currentIndex); // hidden/internal index

                // Log outputs
                outputValues[currentItemVarName] = items[currentIndex];
                outputValues[currentItemIndexVarName] = currentIndex;
                outputValues["Status"] = "Successfully moved to next item";

                // Set success status
                nodeExecutionlog.IsSuccess = true;
                nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();

                return (true, nodeExecutionlog);
            }
            catch (Exception ex)
            {
                outputValues["Status"] = $"Error in MoveNextListItem: {ex.Message}";
                nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
                nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertValueForLoggingUtil.ConvertValueForLogging(kv.Key, kv.Value, "Output", false) }).ToList();
                return (false, nodeExecutionlog);
            }
        }

        private static object ConvertArgument(object inputValue, Type targetType)
        {
            if (inputValue == null || targetType == null)
                return inputValue;

            try
            {
                // Handle enum types
                if (targetType.IsEnum)
                {
                    return Enum.Parse(targetType, inputValue.ToString(), ignoreCase: true);
                }

                // Handle JToken from JSON string
                if (targetType == typeof(JToken) && inputValue is string inputValueStr)
                {
                    return JToken.Parse(inputValueStr);
                }

                // Handle JToken passthrough
                if (targetType == typeof(JToken) && inputValue is JToken jToken)
                {
                    return jToken;
                }

                // Handle Dictionary<string, string> from JSON string
                if (targetType == typeof(Dictionary<string, string>) && inputValue is string inputValueStr2)
                {
                    return JsonConvert.DeserializeObject<Dictionary<string, string>>(inputValueStr2);
                }

                // If targetType is string and inputValue type is DataTable
                if (targetType == typeof(string) && inputValue is DataTable dt)
                {
                    var sb = new StringBuilder();
                    var columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName);
                    sb.AppendLine(string.Join(",", columns));
                    foreach (DataRow row in dt.Rows)
                        sb.AppendLine(string.Join(",", row.ItemArray.Select(x => x?.ToString() ?? "")));
                    return sb.ToString().Trim();
                }

                // If targetType is string and inputValue is IEnumerable (but not string)
                if (targetType == typeof(string) && inputValue is IEnumerable enumerable && !(inputValue is string))
                {
                    return JsonConvert.SerializeObject(inputValue);
                }

                // Handle arrays
                if (targetType.IsArray && inputValue is string arrStr)
                {
                    var elemType = targetType.GetElementType();
                    var items = arrStr.Split(',').Select(s => ConvertArgument(s.Trim(), elemType)).ToArray();
                    var array = Array.CreateInstance(elemType, items.Length);
                    for (int i = 0; i < items.Length; i++)
                        array.SetValue(items[i], i);
                    return array;
                }

                // Handle List<T>
                if (targetType.IsGenericType && targetType.GetGenericTypeDefinition() == typeof(List<>))
                {
                    var elemType = targetType.GetGenericArguments()[0];
                    if (inputValue is string listStr)
                    {
                        var items = listStr.Split(',').Select(s => ConvertArgument(s.Trim(), elemType)).ToList();
                        var list = (IList)Activator.CreateInstance(targetType);
                        foreach (var item in items)
                            list.Add(item);
                        return list;
                    }
                    if (inputValue is IEnumerable enumerable2)
                    {
                        var list = (IList)Activator.CreateInstance(targetType);
                        foreach (var item in enumerable2)
                            list.Add(ConvertArgument(item, elemType));
                        return list;
                    }
                }

                // Handle SecureString
                if (targetType == typeof(System.Security.SecureString) && inputValue is string secureStr)
                {
                    var secureString = new System.Security.SecureString();
                    foreach (char c in secureStr)
                        secureString.AppendChar(c);
                    secureString.MakeReadOnly();
                    return secureString;
                }

                return Convert.ChangeType(inputValue, targetType);
            }
            catch
            {
                return inputValue;
            }
        }

        private static object InferType(string value)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(value))
                    return value;

                // Try bool
                if (bool.TryParse(value, out var boolResult))
                    return boolResult;

                // Try int
                if (int.TryParse(value, out var intResult))
                    return intResult;

                // Try long
                if (long.TryParse(value, out var longResult))
                    return longResult;

                // Try decimal
                if (decimal.TryParse(value, out var decResult))
                    return decResult;

                // Try double
                if (double.TryParse(value, out var dblResult))
                    return dblResult;

                // Try DateTime
                if (DateTime.TryParse(value, out var dtResult))
                    return dtResult;

                return value;
            }
            catch
            {
                // If any error occurs, return the original value
                return value;
            }
        }

        // Helper to resolve variable if value is in {{varName}} format using Dynamic Expresso
        public static object ResolveTemplate(string template, ExecutionContext executionContext, Interpreter interpreter)
        {
            if (string.IsNullOrEmpty(template))
                return template;

            //if (template.Contains("{{RetrievedFiles}}"))
            //    System.Diagnostics.Debugger.Break();

            // Helper to recursively resolve all {{...}} placeholders
            string ResolvePlaceholders(string input)
            {
                Regex placeholderRegex = new Regex(@"(?<!@)\{\{([^\{\}]+)\}\}");
                string result = input;
                int safety = 0; // Prevent infinite loops

                while (placeholderRegex.IsMatch(result) && safety < 10)
                {
                    result = placeholderRegex.Replace(result, match =>
                    {
                        var expr = match.Groups[1].Value.Trim();
                        try
                        {
                            var value = interpreter.Eval(expr);
                            return value?.ToString();
                        }
                        catch
                        {
                            return match.Value; // leave as is if evaluation fails
                        }
                    });
                    safety++;
                }
                return result;
            }

            // If the template is exactly a single variable/expression like {{MyList[0].Name}}
            var singleVarMatch = Regex.Match(template, @"^\s*\{\{([^\}]+)\}\}\s*$");
            if (singleVarMatch.Success)
            {
                // Recursively resolve any inner placeholders in the expression
                var expr = ResolvePlaceholders(singleVarMatch.Groups[1].Value.Trim());
                try
                {
                    return interpreter.Eval(expr);
                }
                catch
                {
                    return template;
                }
            }

            // Otherwise, recursively resolve all placeholders in the template
            var finalResult = ResolvePlaceholders(template);
            return finalResult;
        }

        public static string GetJsonProperty(string jsonString, string propertyPath)
        {
            if (string.IsNullOrWhiteSpace(jsonString) || string.IsNullOrWhiteSpace(propertyPath))
                return null;

            try
            {
                JObject obj = JObject.Parse(jsonString);

                // SelectToken supports JSONPath syntax
                JToken token = obj.SelectToken(propertyPath);

                return token?.ToString();
            }
            catch
            {
                // We can log the error if needed, but for now just return null
                return null;
            }
        }
    }
}
