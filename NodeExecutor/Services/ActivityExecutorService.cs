using NodeExecutor.Models;
using System;
using System.Activities;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Windows.Input;

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

        public static bool ExecuteNode(NodeData node, ExecutionContext executionContext)
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
                            // Use expression-based InArgument<T>
                            //var funcType = typeof(Func<,>).MakeGenericType(typeof(ActivityContext), genericType);
                            //var lambdaExpr = Delegate.CreateDelegate(funcType, convertedValue, nameof(ToString)); // workaround for delegate instantiation

                            //inArgument = Activator.CreateInstance(inArgGenericType, new object[] { (Func<ActivityContext, object>)(ctx => convertedValue) });


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


                    //// Set the value to the property
                    //if (convertedValue != null && genericType != null)
                    //{
                    //    var inArgGenericType = typeof(InArgument<>).MakeGenericType(genericType);
                    //    var lambdaExpr = Activator.CreateInstance(inArgGenericType, new object[] { (Func<ActivityContext, object>)(ctx => convertedValue) });
                    //    prop.SetValue(activityInstance, lambdaExpr);
                    //    continue;
                    //}

                    //object inArgument = Activator.CreateInstance(propType, convertedValue);
                    //prop.SetValue(activityInstance, inArgument);
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

        public static object ResolveTemplate(string template, ExecutionContext context)
        {
            try
            {
                // Match double curly-brace variables like {{username}} but not \{{username}}
                Regex PlaceholderRegex = new Regex(@"(?<!\\)\{\{(?<key>[^\}]+)\}\}");

                // Replace {{key}} with context value
                var key = PlaceholderRegex.Replace(template, match =>
                {
                    return match.Groups["key"].Value;
                });

                // If the key is empty, return the template as-is
                if (string.IsNullOrEmpty(key))
                    return template;

                // Try to get the value from the context
                var contextValue = context.TryGet(key, out var val) ? val : null;
                
                // If value is null, return the placeholder as-is
                if (contextValue == null)
                    return $"{{{{{key}}}}}"; // leave as-is if not found

                return contextValue;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ResolveTemplate: {ex.Message}");
                return template;
            }
        }
    }
}
