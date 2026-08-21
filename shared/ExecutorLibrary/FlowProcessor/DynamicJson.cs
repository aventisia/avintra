using System.Collections;
using System.Dynamic;

namespace ExecutorLibrary.FlowProcessor;

/// <summary>
/// A dynamic object that supports both dot-notation (<c>obj.Key</c>) and string indexing
/// (<c>obj["Key"]</c>) through the C# dynamic binder.
/// </summary>
/// <remarks>
/// <see cref="ExpandoObject"/> supports dot-notation but NOT string indexing, because its
/// <c>MetaExpando</c> class does not override <c>TryGetIndex</c>. Even though
/// <see cref="ExpandoObject"/> implements <see cref="IDictionary{TKey, TValue}"/>, the indexer
/// is an explicit interface implementation, so the C# runtime binder
/// (<c>Microsoft.CSharp.RuntimeBinder.Binder.GetIndex</c>) cannot resolve it through dynamic
/// dispatch and throws <c>RuntimeBinderException: Cannot apply indexing with [] to an
/// expression of type 'System.Dynamic.ExpandoObject'</c>.
/// <para>
/// This class is used to represent JSON objects in <see cref="FlowExecutionContext"/> so that
/// template expressions like <c>{{data[0].Value["nested key"]}}</c> work correctly with
/// DynamicExpresso. It also implements <see cref="IDictionary{TKey, TValue}"/> for
/// <see cref="System.Text.Json.JsonSerializer"/> compatibility and backward compatibility with
/// code that checks for <c>IDictionary&lt;string, object?&gt;</c>.
/// </para>
/// </remarks>
public class DynamicJson : DynamicObject, IDictionary<string, object?>
{
    private readonly Dictionary<string, object?> _dictionary = new();

    // --- DynamicObject overrides (for DynamicExpresso dot-notation and indexing) ---

    public override bool TryGetMember(GetMemberBinder binder, out object? result)
        => _dictionary.TryGetValue(binder.Name, out result);

    public override bool TrySetMember(SetMemberBinder binder, object? value)
    {
        _dictionary[binder.Name] = value;
        return true;
    }

    public override bool TryGetIndex(GetIndexBinder binder, object[] indexes, out object? result)
    {
        if (indexes.Length == 1)
        {
            var key = indexes[0]?.ToString();
            if (!string.IsNullOrEmpty(key) && _dictionary.TryGetValue(key, out result))
                return true;

            // The C# runtime binder swallows a false return and produces null, which makes
            // template typos silently resolve to empty strings. Throwing here surfaces
            // the mistake with a clear key name, matching the IDictionary indexer behavior.
            throw new KeyNotFoundException($"The given key '{key}' was not present in the DynamicJson object.");
        }

        result = null;
        return false;
    }

    public override bool TrySetIndex(SetIndexBinder binder, object[] indexes, object? value)
    {
        if (indexes.Length == 1)
        {
            var key = indexes[0]?.ToString();
            if (!string.IsNullOrEmpty(key))
            {
                _dictionary[key] = value;
                return true;
            }
        }

        return false;
    }

    public override IEnumerable<string> GetDynamicMemberNames() => _dictionary.Keys;

    // --- IDictionary<string, object?> implementation (for JsonSerializer and compatibility) ---

    public object? this[string key]
    {
        get => _dictionary[key];
        set => _dictionary[key] = value;
    }

    public ICollection<string> Keys => _dictionary.Keys;
    public ICollection<object?> Values => _dictionary.Values;
    public int Count => _dictionary.Count;
    public bool IsReadOnly => false;

    public void Add(string key, object? value) => _dictionary.Add(key, value);
    public void Add(KeyValuePair<string, object?> item) => _dictionary.Add(item.Key, item.Value);
    public void Clear() => _dictionary.Clear();

    public bool Contains(KeyValuePair<string, object?> item)
        => _dictionary.TryGetValue(item.Key, out var val) && Equals(val, item.Value);

    public bool ContainsKey(string key) => _dictionary.ContainsKey(key);

    public void CopyTo(KeyValuePair<string, object?>[] array, int arrayIndex)
    {
        foreach (var kvp in _dictionary)
            array[arrayIndex++] = kvp;
    }

    public IEnumerator<KeyValuePair<string, object?>> GetEnumerator() => _dictionary.GetEnumerator();

    public bool Remove(string key) => _dictionary.Remove(key);
    public bool Remove(KeyValuePair<string, object?> item) => _dictionary.Remove(item.Key);

    public bool TryGetValue(string key, out object? value) => _dictionary.TryGetValue(key, out value);

    IEnumerator IEnumerable.GetEnumerator() => _dictionary.GetEnumerator();
}