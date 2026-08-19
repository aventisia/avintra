using DynamicExpresso;
using System.Collections;
using System.Dynamic;

namespace ExecutorLibrary.FlowProcessor;

public class FlowExecutionContext
{
    private static readonly Regex PlaceholderRegex = new(@"(?<!@)\{\{([^\{\}]+)\}\}", RegexOptions.Compiled);
    private static readonly Regex SingleVarRegex = new(@"^\s*\{\{([^\}]+)\}\}\s*$", RegexOptions.Compiled);
    private readonly Dictionary<string, object?> _variables = new(StringComparer.OrdinalIgnoreCase);

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
        Interpreter.SetVariable(key, ConvertForInterpreter(value));
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
        // Convert JsonElement into an interpreter-friendly dynamic structure
        // (ExpandoObject / List<object?>) so dot-notation and indexing work.
        if (value is JsonElement jsonElement)
        {
            value = ConvertJsonElement(jsonElement);
        }

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
                    // If evaluation fails, try simple variable lookup
                    if (_variables.TryGetValue(expr, out var directValue))
                    {
                        return directValue;
                    }

                    return stringValue + " Error: " + ex.Message; // Return original with error message if all resolution fails
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
                    return evaluated?.ToString() ?? string.Empty;
                }
                catch
                {
                    // Fallback: try simple dictionary lookup
                    if (_variables.TryGetValue(expr, out var value))
                    {
                        return value?.ToString() ?? string.Empty;
                    }

                    return match.Value; // Leave as-is if evaluation fails
                }
            });
            safety++;
        }

        return result;
    }

    /// <summary>
    /// Recursively converts values into forms that DynamicExpresso can evaluate
    /// with dot-notation and indexing. JsonElements become ExpandoObjects or lists,
    /// and nested dictionaries/enumerables are flattened the same way.
    /// </summary>
    private static object? ConvertForInterpreter(object? value)
    {
        if (value is null)
            return null;

        if (value is JsonElement element)
            return ConvertJsonElement(element);

        if (value is string)
            return value;

        if (value is IDictionary dictionary)
        {
            var expando = new ExpandoObject() as IDictionary<string, object?>;
            foreach (var key in dictionary.Keys)
            {
                var keyString = key?.ToString();
                if (!string.IsNullOrWhiteSpace(keyString) && key is not null)
                {
                    expando[keyString] = ConvertForInterpreter(dictionary[key]);
                }
            }
            return expando;
        }

        // ExpandoObject and other generic string-keyed dictionaries must be preserved
        // as objects so dot-notation (e.g. CurrentItem.name) works in DynamicExpresso.
        if (value is IDictionary<string, object?> genericDictionary)
        {
            var expando = new ExpandoObject() as IDictionary<string, object?>;
            foreach (var kvp in genericDictionary)
            {
                if (!string.IsNullOrWhiteSpace(kvp.Key))
                {
                    expando[kvp.Key] = ConvertForInterpreter(kvp.Value);
                }
            }
            return expando;
        }

        if (value is IEnumerable enumerable)
        {
            return enumerable.Cast<object?>().Select(ConvertForInterpreter).ToList();
        }

        return value;
    }

    private static object? ConvertJsonElement(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                var expando = new ExpandoObject() as IDictionary<string, object?>;
                foreach (var property in element.EnumerateObject())
                {
                    expando[property.Name] = ConvertJsonElement(property.Value);
                }
                return expando;

            case JsonValueKind.Array:
                return element.EnumerateArray().Select(ConvertJsonElement).ToList();

            case JsonValueKind.String:
                return element.GetString();

            case JsonValueKind.Number:
                return element.TryGetInt64(out var longValue) ? longValue : element.GetDouble();

            case JsonValueKind.True:
                return true;

            case JsonValueKind.False:
                return false;

            case JsonValueKind.Null:
            case JsonValueKind.Undefined:
                return null;

            default:
                return element.GetRawText();
        }
    }
}
