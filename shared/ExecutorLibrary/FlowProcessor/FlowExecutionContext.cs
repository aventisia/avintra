using DynamicExpresso;
using System.Collections;
using System.Dynamic;

namespace ExecutorLibrary.FlowProcessor;

public class FlowExecutionContext
{
    private static readonly Regex PlaceholderRegex = new(@"(?<!@)\{\{([^\{\}]+)\}\}", RegexOptions.Compiled);
    private static readonly Regex SingleVarRegex = new(@"^\s*\{\{([^\}]+)\}\}\s*$", RegexOptions.Compiled);
    private readonly Dictionary<string, object?> _variables = new(StringComparer.OrdinalIgnoreCase);

    /// <summary>
    /// Id of the parent-flow node (callAgentNode/blockNode) that invoked the sub-flow currently
    /// executing. Empty for the top-level flow. This is an internal runtime marker, deliberately
    /// NOT stored in <see cref="_variables"/> so it stays invisible to node template resolution.
    /// </summary>
    public string CallerReferenceId { get; set; } = string.Empty;

    /// <summary>
    /// Id of the innermost active loop (forLoopNode) when a node executes. Empty when not inside
    /// a loop. Internal runtime marker, not exposed to template resolution.
    /// </summary>
    public string LoopReferenceId { get; set; } = string.Empty;

    /// <summary>
    /// Zero-based iteration index of the innermost active loop when a node executes. -1 when not
    /// inside a loop. Internal runtime marker, not exposed to template resolution.
    /// </summary>
    public int LoopIterationIndex { get; set; } = -1;

    public FlowExecutionContext()
    {
        Interpreter = new Interpreter(InterpreterOptions.Default | InterpreterOptions.LambdaExpressions | InterpreterOptions.CaseInsensitive);
    }

    public Interpreter Interpreter { get; }

    public IReadOnlyDictionary<string, object?> Variables => _variables;

    public void Set(string key, object? value)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            return;
        }

        _variables[key] = value;
        Interpreter.SetVariable(key, JsonToDynamicConverter.ConvertForInterpreter(value));
    }

    public T? Get<T>(string key)
    {
        if (!_variables.TryGetValue(key, out var value) || value is null)
        {
            return default;
        }

        if (value is T typed)
        {
            return typed;
        }

        return (T)Convert.ChangeType(value, typeof(T));
    }

    public bool TryGet<T>(string key, out T? value)
    {
        value = default;

        if (!_variables.TryGetValue(key, out var raw) || raw is null)
        {
            return false;
        }

        if (raw is T typed)
        {
            value = typed;
            return true;
        }

        try
        {
            value = (T)Convert.ChangeType(raw, typeof(T));
            return true;
        }
        catch
        {
            return false;
        }
    }

    public bool TryGet(string key, out object? value)
    {
        return _variables.TryGetValue(key, out value);
    }

    /// <summary>
    /// Resolves all {{expression}} placeholders in the input string using DynamicExpresso.
    /// Always returns a string (all placeholders are replaced with their string representation).
    /// </summary>
    public string ResolveTemplate(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return input;
        }

        return ResolvePlaceholdersToString(input);
    }

    /// <summary>
    /// Resolves template expressions. If the value is a single {{expression}}, evaluates and returns
    /// the raw object (preserving type). If it contains mixed text and expressions, returns a resolved string.
    /// This mirrors the runner app's ResolveTemplate behavior using DynamicExpresso.
    /// </summary>
    public object? ResolveTemplateObject(object? value)
    {
        // Convert JsonElement / JsonNode into an interpreter-friendly dynamic structure
        // (DynamicJson / List<object?>) so dot-notation and indexing work.
        value = value switch
        {
            JsonElement jsonElement => JsonToDynamicConverter.ConvertJsonElement(jsonElement),
            JsonNode jsonNode => JsonToDynamicConverter.ConvertJsonNode(jsonNode),
            _ => JsonToDynamicConverter.ConvertForInterpreter(value)
        };

        if (value is string stringValue && stringValue.Contains("{{") && stringValue.Contains("}}"))
        {
            // If the entire value is a single expression like {{MyList[0].Name}}, return the raw evaluated object
            var singleVarMatch = SingleVarRegex.Match(stringValue);
            if (singleVarMatch.Success)
            {
                var expr = ResolvePlaceholdersToString(singleVarMatch.Groups[1].Value.Trim());
                try
                {
                    return Interpreter.Eval(expr);
                }
                catch (Exception ex)
                {
                    _ = ex; // variable is required by the when filter
                    // If evaluation fails, try simple variable lookup
                    if (_variables.TryGetValue(expr, out var directValue))
                    {
                        return directValue;
                    }

                    // Missing key / bad indexer: keep the original placeholder as-is so
                    // the expression isn't lost when the referenced value doesn't exist.
                    return stringValue;
                }
            }

            // Otherwise, resolve all placeholders to produce a final string
            return ResolvePlaceholdersToString(stringValue);
        }

        return value;
    }

    /// <summary>
    /// Iteratively resolves all {{...}} placeholders in a string using DynamicExpresso.
    /// Supports nested placeholders and complex expressions (dot notation, indexing, arithmetic).
    /// </summary>
    private string ResolvePlaceholdersToString(string input)
    {
        var result = input;
        var safety = 0;

        while (PlaceholderRegex.IsMatch(result) && safety < 10)
        {
            result = PlaceholderRegex.Replace(result, match =>
            {
                var expr = match.Groups[1].Value.Trim();
                try
                {
                    var evaluated = Interpreter.Eval(expr);
                    return ObjectToString(evaluated);
                }
                catch (Exception ex) when (ex is KeyNotFoundException || ex.InnerException is KeyNotFoundException
                                           || ex is Microsoft.CSharp.RuntimeBinder.RuntimeBinderException)
                {
                    // Missing key / bad indexer: leave the original placeholder in place
                    // so users see the template as-is rather than failing the whole node.
                    if (_variables.TryGetValue(expr, out var value))
                    {
                        return ObjectToString(value);
                    }

                    return match.Value;
                }
                catch
                {
                    // Fallback: try simple dictionary lookup
                    if (_variables.TryGetValue(expr, out var value))
                    {
                        return ObjectToString(value);
                    }

                    return match.Value; // Leave as-is if evaluation fails
                }
            });
            safety++;
        }

        return result;
    }

    /// <summary>
    /// Converts an evaluated object to its string representation.
    /// DynamicJson / ExpandoObject / dictionary-backed dynamic objects are serialized as JSON
    /// because their default ToString() returns the class name.
    /// </summary>
    private static string ObjectToString(object? value)
    {
        if (value is null)
            return string.Empty;

        if (value is string s)
            return s;

        if (value is DynamicJson || value is ExpandoObject || value is IDictionary<string, object?>)
        {
            try
            {
                return JsonSerializer.Serialize(value);
            }
            catch
            {
                return value.ToString() ?? string.Empty;
            }
        }

        return value.ToString() ?? string.Empty;
    }
}
