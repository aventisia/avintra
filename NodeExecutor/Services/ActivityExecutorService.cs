using CodeActivitiesLibrary.WorkflowLogics.ConditionalsLoopsActivities;
using Newtonsoft.Json;
using NodeExecutor.Models;
using System;
using System.Activities;
using System.Collections.Generic;
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

        public static bool ExecuteNode(ActivityNodeData node, ExecutionContext executionContext)
        {
            try
            {
                // Get Code activity instance
                var activityInstance = GetCodeActivityInstance(node.CodeActivityName);

                // Get the type of the activity instance
                var activityType = activityInstance.GetType();

                // Set InArguments via reflection
                foreach (var input in node.NodeInputs)
                {
                    // TODO: if input does not have value return (in case of optional fields. all activity optional arugments should have default value)
                    // We can check using reflaction if the property has a default value or not and throw error later
                    if (string.IsNullOrEmpty(input.Value)) continue;

                    // Get the property info for the input key
                    var prop = activityType.GetProperty(input.Key, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (prop == null) continue;

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
                    }
                }

                // Execute the activity
                var outputs = WorkflowInvoker.Invoke((Activity)activityInstance);

                // Set OutArguments via reflection
                foreach (var nodeOutput in node.NodeOutputs)
                {
                    // Get the property info for the output key
                    var prop = activityType.GetProperty(nodeOutput.Key, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (prop == null) continue;

                    // Replace {{ and }} if exits
                    nodeOutput.Value.Value = nodeOutput.Value.Value.Replace("{{", "").Replace("}}", "");

                    // Trim the output value
                    nodeOutput.Value.Value = nodeOutput.Value.Value.Trim();

                    // Set the output value in the execution context
                    if (outputs != null && outputs.ContainsKey(nodeOutput.Key))
                    {
                        executionContext.Set(nodeOutput.Value.Value, outputs[nodeOutput.Key]);
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ExecuteNode: {ex.Message}");
                return false;
            }
        }

        public static bool ExecuteCondition(ConditionalBranchNodeData node, ExecutionContext executionContext)
        {
            try
            {
                // Get Code activity instance
                var activityInstance = GetCodeActivityInstance("ConditionalBranchActivity");
                var activityType = activityInstance.GetType();

                // Prepare the nested list of ConditionObjectGroup with resolved values
                var resolvedGroups = new List<List<ConditionObjectGroup>>();
                foreach (var group in node.Conditions) // node.Conditions: IList<IList<ConditionGroup>>
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

                // Execute the activity
                var outputs = WorkflowInvoker.Invoke((Activity)activityInstance);

                // Directly return the ConditionResult output (do not set in execution context)
                if (outputs != null && outputs.ContainsKey("ConditionResult"))
                {
                    var result = outputs["ConditionResult"];
                    return result is bool b ? b : false;
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ExecuteCondition: {ex.Message}");
                return false;
            }
        }

        private static object ConvertArgument(object inputValue, Type targetType)
        {
            if (inputValue == null || targetType == null)
                return inputValue;

            try
            {
                if (targetType.IsEnum)
                {
                    return Enum.Parse(targetType, inputValue.ToString(), ignoreCase: true);
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

            // Fallback to string
            return value;
        }

        // Helper to resolve variable if value is in {{varName}} format
        public static object ResolveTemplate(string template, ExecutionContext context)
        {
            try
            {
                // If template is null or empty, return as-is
                if (string.IsNullOrEmpty(template))
                    return template;

                // If the template is exactly a single variable reference like {{myVar}}
                var singleVarMatch = Regex.Match(template, @"^\s*\{\{([^\}]+)\}\}\s*$");
                if (singleVarMatch.Success)
                {
                    var key = singleVarMatch.Groups[1].Value.Trim();
                    if (context.TryGet(key, out var value))
                        return value;
                    return null;
                }

                // Otherwise, do string replacement for embedded variables
                // Match double curly-brace variables like {{username}} but not \{{username}}
                Regex PlaceholderRegex = new Regex(@"(?<!\\)\{\{(?<key>[^\}]+)\}\}");

                // Replace {{key}} with context value
                var result = PlaceholderRegex.Replace(template, match =>
                {
                    var key = match.Groups["key"].Value.Trim();
                    if (context.TryGet(key, out var value) && value != null)
                    {
                        // Handle DataTable
                        if (value is DataTable dt)
                        {
                            // Example: Convert DataTable to CSV string
                            var sb = new StringBuilder();
                            var columns = dt.Columns.Cast<DataColumn>().Select(c => c.ColumnName);
                            sb.AppendLine(string.Join(",", columns));
                            foreach (DataRow row in dt.Rows)
                                sb.AppendLine(string.Join(",", row.ItemArray.Select(x => x?.ToString() ?? "")));
                            return sb.ToString().Trim();
                        }
                        // Handle IEnumerable (but not string)
                        else if (value is System.Collections.IEnumerable enumerable && !(value is string))
                        {
                            return JsonConvert.SerializeObject(value); // for JSON
                        }
                        // Default: ToString
                        else
                        {
                            return value.ToString();
                        }
                    }
                    return match.Value; // leave as-is if not found
                });

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ResolveTemplate: {ex.Message}");
                return template;
            }
        }
    }
}
