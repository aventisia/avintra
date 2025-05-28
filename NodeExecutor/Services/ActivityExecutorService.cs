using NodeExecutor.Models;
using System;
using System.Activities;
using System.Linq;
using System.Reflection;
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
                    // Get the property info for the input key
                    var prop = activityType.GetProperty(input.Key, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (prop == null) continue;

                    // Check if the property is an Argument<T>
                    var propType = prop.PropertyType;
                    var genericType = propType.IsGenericType ? propType.GetGenericArguments()[0] : null;

                    // Resolve template if input is string and contains {{ }}
                    object inputValue = input.Value;
                    if (input.Value is string strVal && strVal.Contains("{{"))
                    {
                        inputValue = ResolveTemplate(strVal, executionContext);
                    }

                    // Convert the input value to the appropriate type
                    object convertedValue = ConvertArgument(inputValue, genericType);

                    // Set the value to the property
                    object inArgument = Activator.CreateInstance(propType, convertedValue);
                    prop.SetValue(activityInstance, inArgument);
                }

                // Execute the activity
                var outputs = WorkflowInvoker.Invoke((Activity)activityInstance);

                // Set OutArguments via reflection
                foreach (var output in node.NodeOutputs)
                {
                    // Get the property info for the output key
                    var prop = activityType.GetProperty(output.Key, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (prop == null) continue;

                    // Set the output value in the execution context
                    if (outputs != null && outputs.ContainsKey(output.Key))
                    {
                        executionContext.Set(output.Value.Value, outputs[output.Key]);
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

        public static string ResolveTemplate(string template, ExecutionContext context)
        {
            try
            {
                // Match double curly-brace variables like {{username}} but not \{{username}}
                Regex PlaceholderRegex = new Regex(@"(?<!\\)\{\{(?<key>[^\}]+)\}\}");

                // Replace {{key}} with context value
                var result = PlaceholderRegex.Replace(template, match =>
                {
                    var key = match.Groups["key"].Value;
                    return context.TryGet(key, out var value)
                        ? value?.ToString() ?? string.Empty
                        : $"{{{{{key}}}}}"; // leave as-is if not found
                });

                // Unescape \{{key}} to {{key}}
                result = result.Replace(@"\{{", "{{");

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
