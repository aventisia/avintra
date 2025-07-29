using CodeActivitiesLibrary.WorkflowLogics.ConditionalsLoopsActivities;
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

        public static (bool, NodeExecutionLog) ExecuteNode(ActivityNodeData node, ExecutionContext executionContext, DateTime startTime)
        {
            // Initiaze the return object
            var nodeExecutionlog = new NodeExecutionLog
            {
                NodeId = node.Id,
                NodeName = node.NodeName,
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
                // Get Code activity instance
                var activityInstance = GetCodeActivityInstance(node.CodeActivityName);

                // Get the type of the activity instance
                var activityType = activityInstance.GetType();

                foreach (var input in node.NodeInputs)
                {
                    // TODO: if input does not have value return (in case of optional fields. all activity optional arugments should have default value)
                    // We can check using reflaction if the property has a default value or not and throw error later
                    if (string.IsNullOrEmpty(input.Value)) continue;

                    // Get the property info for the input key
                    var prop = activityType.GetProperty(input.Key, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (prop == null) continue;

                    // Get input label
                    var displayName = prop.GetCustomAttribute<DisplayNameAttribute>()?.DisplayName ?? prop.Name;

                    // Check if the property is an Argument<T>
                    var propType = prop.PropertyType;
                    var genericType = propType.IsGenericType ? propType.GetGenericArguments()[0] : null;

                    // Resolve template if input is string and contains {{ }}
                    object inputValue = input.Value;
                    if (input.Value is string strVal && strVal.Contains("{{") && strVal.Contains("}}"))
                    {
                        inputValue = ResolveTemplate(strVal, executionContext);
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
                            var valueConst = Expression.Constant(convertedValue, genericType);
                            var lambdaExpr = Expression.Lambda(
                                typeof(Func<,>).MakeGenericType(typeof(ActivityContext), genericType),
                                valueConst,
                                Expression.Parameter(typeof(ActivityContext), "ctx")
                            );

                            inArgument = Activator.CreateInstance(inArgGenericType, lambdaExpr);
                        }

                        prop.SetValue(activityInstance, inArgument);

                        // Add to inputValues for logging
                        inputValues[displayName] = convertedValue;
                    }
                }

                // Set inputValues to nodeExecutionLog object
                nodeExecutionlog.Inputs = inputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertLogValueForLogging(kv.Key, kv.Value) }).ToList();

                // Execute the activity
                var outputs = WorkflowInvoker.Invoke((Activity)activityInstance);

                // Set isSuccess activity status
                nodeExecutionlog.IsSuccess = outputs != null && Convert.ToBoolean(outputs["IsSuccess"]);

                foreach (var nodeOutput in node.NodeOutputs)
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

            // Update duration and outputValues
            nodeExecutionlog.Duration = (DateTime.UtcNow - startTime).TotalSeconds;
            nodeExecutionlog.Outputs = outputValues.Select(kv => new NodeLogKeyValue { Key = kv.Key, Value = ConvertLogValueForLogging(kv.Key, kv.Value) }).ToList();

            // Return
            return (nodeExecutionlog.IsSuccess, nodeExecutionlog);
        }

        public static (bool, string) ExecuteCondition(List<List<ConditionGroup>> conditions, ExecutionContext executionContext)
        {
            // If conditions null or empty return false
            if (conditions == null || conditions.Count == 0)
                return (false, "");

            //// Initiaze the return object
            //var nodeExecutionlog = new NodeExecutionLog
            //{
            //    NodeId = node.Id,
            //    NodeName = node.NodeName,
            //    IsSuccess = false,
            //    Duration = 0,
            //    Inputs = new List<NodeLogKeyValue>(),
            //    Outputs = new List<NodeLogKeyValue>()
            //};

            //// Initialize input and output dictionaries
            //var inputValues = new Dictionary<string, object>();
            //var outputValues = new Dictionary<string, object>(){
            //    { "Status", "Node executed successfully" }
            //};

            // Check conditions
            try
            {
                // Get Code activity instance
                var activityInstance = GetCodeActivityInstance("ConditionalBranchActivity");
                var activityType = activityInstance.GetType();

                // Prepare the nested list of ConditionObjectGroup with resolved values
                var resolvedGroups = new List<List<ConditionObjectGroup>>();
                foreach (var group in conditions) // node.Conditions: IList<IList<ConditionGroup>>
                {
                    var resolvedGroup = new List<ConditionObjectGroup>();
                    foreach (var cond in group)
                    {
                        // Resolve the first value
                        var resolvedFirst = ResolveTemplate(cond.FirstValue, executionContext);
                        if (resolvedFirst is string s1 && !cond.FirstValue.Trim().StartsWith("{{"))
                            resolvedFirst = InferType(s1);

                        // Resolve the second value
                        var resolvedSecond = ResolveTemplate(cond.SecondValue, executionContext);
                        if (resolvedSecond is string s2 && !cond.SecondValue.Trim().StartsWith("{{"))
                            resolvedSecond = InferType(s2);

                        resolvedGroup.Add(new ConditionObjectGroup
                        {
                            FirstValue = resolvedFirst,
                            ComparisonOperator = cond.ComparisonOperator,
                            SecondValue = resolvedSecond
                        });
                    }
                    resolvedGroups.Add(resolvedGroup);
                }

                // Set the Conditions property
                var prop = activityType.GetProperty("Conditions", BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                if (prop != null)
                {
                    var argType = typeof(InArgument<List<List<ConditionObjectGroup>>>);

                    // Build: ctx => resolvedGroups
                    var ctxParam = Expression.Parameter(typeof(ActivityContext), "ctx");
                    var valueExpr = Expression.Constant(resolvedGroups, typeof(List<List<ConditionObjectGroup>>));
                    var lambda = Expression.Lambda(valueExpr, ctxParam);

                    var inArgument = Activator.CreateInstance(argType, lambda);
                    prop.SetValue(activityInstance, inArgument);
                }

                // Execute the branch condition
                var outputs = WorkflowInvoker.Invoke((Activity)activityInstance);

                // Branch activity execution has failed
                // if (outputs != null && outputs.ContainsKey("IsSuccess") && !Convert.ToBoolean(outputs["IsSuccess"]))
                //     return (false, "");

                // Directly return the ConditionResult output (do not set in execution context)
                if (outputs != null && outputs.ContainsKey("ConditionResult"))
                {
                    var result = outputs["ConditionResult"];
                    return result is bool b ? (b, "") : (false, "");
                }

                // If no ConditionResult output, return false
                return (false, "Unknown error ocurred while checing the conditon");
            }
            catch (Exception ex)
            {
                return (false, $"Error in ExecuteCondition: {ex.Message}");
            }
        }

        public static (bool, string) MoveNextListItem(string listVarName, string currentItemVarName, ExecutionContext executionContext)
        {
            // If listVarName or currentItemVarName is null or empty, return false
            if (string.IsNullOrEmpty(listVarName) || string.IsNullOrEmpty(currentItemVarName) || executionContext == null)
                return (false, "");

            //// Initiaze the return object
            //var nodeExecutionlog = new NodeExecutionLog
            //{
            //    NodeId = node.Id,
            //    NodeName = node.NodeName,
            //    IsSuccess = false,
            //    Duration = 0,
            //    Inputs = new List<NodeLogKeyValue>(),
            //    Outputs = new List<NodeLogKeyValue>()
            //};

            //// Initialize input and output dictionaries
            //var inputValues = new Dictionary<string, object>();
            //var outputValues = new Dictionary<string, object>(){
            //    { "Status", "Node executed successfully" }
            //};

            try
            {
                // Resolve the list variable name in case it contains a template
                var resolvedListVar = ResolveTemplate(listVarName, executionContext);

                // If resolvedListVar is a string, treat it as the key to look up in executionContext
                object listObj = resolvedListVar;
                if (resolvedListVar is string key)
                {
                    if (!executionContext.TryGet(key, out listObj) || listObj == null)
                        return (false, "");
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
                    return (false, "");

                // Convert to a list for indexing
                var items = enumerable.Cast<object>().ToList();
                if (items.Count == 0)
                    return (false, "");

                // Track current index in executionContext (use a hidden variable)
                string indexKey = $"__{listVarName}_CurrentIndex";
                int currentIndex = 0;
                if (executionContext.TryGet(indexKey, out var idxObj) && idxObj is int idx)
                    currentIndex = idx + 1; // Move to next item

                if (currentIndex >= items.Count)
                    return (false, ""); // No more items

                // Set current item and index in executionContext
                executionContext.Set(currentItemVarName, items[currentIndex]);
                executionContext.Set(indexKey, currentIndex);

                return (true, "");
            }
            catch (Exception ex)
            {
                return (false, $"Error in MoveNextListItem: {ex.Message}");
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

                // Handle Dictionary<string, string> from JSON string
                if (targetType == typeof(Dictionary<string, string>) && inputValue is string inputValueStr)
                {
                    return JsonConvert.DeserializeObject<Dictionary<string, string>>(inputValueStr);
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

        // Helper to resolve variable if value is in {{varName}} format
        public static object ResolveTemplate(string template, ExecutionContext context)
        {
            try
            {
                if (string.IsNullOrEmpty(template))
                    return template;

                // Helper to resolve variable with dot notation and indexers
                object ResolveKey(string key)
                {
                    // Split by dot, but ignore dots inside brackets
                    var parts = Regex.Split(key, @"\.(?![^\[]*\])");
                    object current = null;

                    // Extract base variable and possible indexer from parts[0]
                    var baseMatch = Regex.Match(parts[0], @"^(?<var>\w+)(\[(?<idx>.+?)\])?$");
                    if (!baseMatch.Success)
                        return null;

                    var baseKey = baseMatch.Groups["var"].Value;
                    if (!context.TryGet(baseKey, out current) || current == null)
                        return null;

                    // Handle indexer on base variable, e.g., CurrentItem[0]
                    if (baseMatch.Groups["idx"].Success)
                    {
                        var idx = baseMatch.Groups["idx"].Value.Trim('\'', '"');
                        if (current is IList list && int.TryParse(idx, out int intIdx))
                        {
                            if (intIdx >= 0 && intIdx < list.Count)
                                current = list[intIdx];
                            else
                                return null;
                        }
                        else if (current is IDictionary dict && dict.Contains(idx))
                        {
                            current = dict[idx];
                        }
                        else if (current is DataTable dt)
                        {
                            if (int.TryParse(idx, out int rowIdx) && rowIdx >= 0 && rowIdx < dt.Rows.Count)
                                current = dt.Rows[rowIdx];
                            else if (dt.Columns.Contains(idx))
                                current = dt.Rows[0][idx];
                            else
                                return null;
                        }
                        else if (current is DataRow row)
                        {
                            if (row.Table.Columns.Contains(idx))
                                current = row[idx];
                            else if (int.TryParse(idx, out int colIdx) && colIdx >= 0 && colIdx < row.Table.Columns.Count)
                                current = row[colIdx];
                            else
                                return null;
                        }
                        else
                        {
                            return null;
                        }
                    }

                    // Special handling for JObject or JSON string
                    if ((current is string s && s.TrimStart().StartsWith("{")) || current is JObject)
                    {
                        // If key is like myJsonObject.user.profile.name, extract the path after the base
                        var jsonPath = string.Join(".", parts.Skip(1));
                        if (string.IsNullOrEmpty(jsonPath))
                            return current;

                        string jsonString = current is JObject jObj ? jObj.ToString() : current.ToString();
                        var jsonValue = GetJsonProperty(jsonString, jsonPath);
                        return jsonValue;
                    }

                    // Traverse properties/indexers as before
                    for (int i = 1; i < parts.Length; i++)
                    {
                        var part = parts[i];

                        // Handle indexer: e.g., [1], ["email"]
                        var indexMatch = Regex.Match(part, @"^(?<prop>\w+)?\[(?<idx>.+?)\]$");
                        if (indexMatch.Success)
                        {
                            var propName = indexMatch.Groups["prop"].Value;
                            var idx = indexMatch.Groups["idx"].Value.Trim('\'', '"');

                            // Property first, if any
                            if (!string.IsNullOrEmpty(propName))
                            {
                                var prop = current.GetType().GetProperty(propName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                                if (prop != null)
                                    current = prop.GetValue(current);
                                else
                                    return null;
                            }

                            // Indexer
                            if (current is IList list && int.TryParse(idx, out int intIdx))
                            {
                                if (intIdx >= 0 && intIdx < list.Count)
                                    current = list[intIdx];
                                else
                                    return null;
                            }
                            else if (current is IDictionary dict && dict.Contains(idx))
                            {
                                current = dict[idx];
                            }
                            else if (current is DataTable dt)
                            {
                                if (int.TryParse(idx, out int rowIdx) && rowIdx >= 0 && rowIdx < dt.Rows.Count)
                                    current = dt.Rows[rowIdx];
                                else if (dt.Columns.Contains(idx))
                                    current = dt.Rows[0][idx];
                                else
                                    return null;
                            }
                            else if (current is DataRow row)
                            {
                                if (row.Table.Columns.Contains(idx))
                                    current = row[idx];
                                else
                                    return null;
                            }
                            else
                            {
                                return null;
                            }
                        }
                        else
                        {
                            // Simple property
                            var prop = current.GetType().GetProperty(part, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                            if (prop != null)
                                current = prop.GetValue(current);
                            else
                                return null;
                        }
                    }
                    return current;
                }

                // If the template is exactly a single variable reference like {{myVar}} or {{MyList.Count}}
                var singleVarMatch = Regex.Match(template, @"^\s*\{\{([^\}]+)\}\}\s*$");
                if (singleVarMatch.Success)
                {
                    var key = singleVarMatch.Groups[1].Value.Trim();
                    return ResolveKey(key);
                }

                // Otherwise, do string replacement for embedded variables
                Regex PlaceholderRegex = new Regex(@"(?<!\\)\{\{(?<key>[^\}]+)\}\}");

                var result = PlaceholderRegex.Replace(template, match =>
                {
                    var key = match.Groups["key"].Value.Trim();
                    var value = ResolveKey(key);
                    if (value != null)
                    {
                        if (value is DataTable dt)
                        {
                            var sb = new StringBuilder();
                            var columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName);
                            sb.AppendLine(string.Join(",", columns));
                            foreach (DataRow row in dt.Rows)
                                sb.AppendLine(string.Join(",", row.ItemArray.Select(x => x?.ToString() ?? "")));
                            return sb.ToString().Trim();
                        }
                        else if (value is System.Collections.IEnumerable enumerable && !(value is string))
                        {
                            return JsonConvert.SerializeObject(value);
                        }
                        else
                        {
                            return value.ToString();
                        }
                    }
                    return match.Value;
                });

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ResolveTemplate: {ex.Message}");
                return template;
            }
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

        public static string ConvertLogValueForLogging(string key, object value)
        {
            if (value == null)
                return "null";

            // Primitive types and string
            var type = value.GetType();
            if (type.IsPrimitive || value is string || value is decimal || value is DateTime || value is Guid || value is TimeSpan || value is Enum)
                return value.ToString();

            // DataTable as CSV
            if (value is DataTable dt)
            {
                var sb = new StringBuilder();
                var columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName);
                sb.AppendLine(string.Join(",", columns));
                foreach (DataRow row in dt.Rows)
                    sb.AppendLine(string.Join(",", row.ItemArray.Select(x => x?.ToString() ?? "")));
                return sb.ToString().Trim();
            }

            // // AutomationElement (UIAutomation)
            // if (value.GetType().FullName == "System.Windows.Automation.AutomationElement")
            // {
            //     return $"[AutomationElement] {key}";
            // }

            // IEnumerable (but not string)
            if (value is System.Collections.IEnumerable enumerable && !(value is string))
            {
                try
                {
                    return JsonConvert.SerializeObject(value);
                }
                catch
                {
                    // fallback: join items as string
                    var items = new List<string>();
                    foreach (var item in enumerable)
                        items.Add(item?.ToString() ?? "null");
                    return "[" + string.Join(", ", items) + "]";
                }
            }

            // Complex object: try JSON
            try
            {
                return JsonConvert.SerializeObject(value);
            }
            catch
            {
                // fallback: type name
                return value.ToString();
            }

        }
    }
}
