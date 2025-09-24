using System.Collections.Generic;

namespace NodeExecutor.Services
{
    public class ExecutionContext
    {
        private readonly Dictionary<string, object> _variables = new Dictionary<string, object>();

        public void Set(string key, object value) => _variables[key] = value;

        public T Get<T>(string key)
        {
            return _variables.TryGetValue(key, out var value) ? (T)value : default;
        }

        public bool TryGet(string key, out object value) => _variables.TryGetValue(key, out value);

        public bool Remove(string key) => _variables.Remove(key);
    }

}
