using DynamicExpresso;

namespace ExecutorLibrary.FlowProcessor;

public class FlowExecutionContext
{
    private static readonly Regex TemplateRegex = new("{{\\s*([a-zA-Z0-9_\\.]+)\\s*}}", RegexOptions.Compiled);
    private readonly Dictionary<string, object?> _variables = new(StringComparer.OrdinalIgnoreCase);

    public FlowExecutionContext()
    {
        Interpreter = new Interpreter();
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
        Interpreter.SetVariable(key, value);
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

    public string ResolveTemplate(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return input;
        }

        return TemplateRegex.Replace(input, match =>
        {
            var variableName = match.Groups[1].Value;

            if (_variables.TryGetValue(variableName, out var value))
            {
                return value?.ToString() ?? string.Empty;
            }

            return string.Empty;
        });
    }

    public object? ResolveTemplateObject(object? value)
    {
        if (value is string text && text.Contains("{{") && text.Contains("}}"))
        {
            return ResolveTemplate(text);
        }

        return value;
    }
}
