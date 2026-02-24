using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using System.Data.SqlClient;

namespace CodeActivitiesLibrary.DataTransformations.DatabaseActivities.Helpers
{
    public static class SqlConnectionManager
    {
        private static readonly ConcurrentDictionary<string, SqlConnection> _connections
            = new ConcurrentDictionary<string, SqlConnection>();

        public static string Add(SqlConnection connection)
        {
            var key = Guid.NewGuid().ToString();
            _connections[key] = connection;
            return key;
        }

        public static SqlConnection Get(string key)
        {
            if (_connections.TryGetValue(key, out var connection))
                return connection;

            return null;
        }

        public static void Remove(string key)
        {
            if (_connections.TryRemove(key, out var connection))
            {
                connection.Close();
                connection.Dispose();
            }
        }
    }
}
