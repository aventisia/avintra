using System.Collections.Generic;

namespace ExecutorLibrary.Helpers;

/// <summary>
/// Extensions for managing bounded collections in the executor.
/// </summary>
internal static class CollectionExtensions
{
    /// <summary>
    /// Adds an item to a list while keeping the list bounded to <paramref name="maxCount"/>.
    /// Oldest entries are removed in O(1) by trimming excess in batches.
    /// </summary>
    public static void EnqueueBounded<T>(this List<T> list, T item, int maxCount)
    {
        list.Add(item);

        if (list.Count > maxCount)
        {
            // Remove oldest entries in a single batch once we exceed the limit by a
            // meaningful amount, keeping the most recent maxCount items. This avoids
            // paying the O(n) List.RemoveAt(0) cost on every addition.
            var excess = list.Count - maxCount;
            list.RemoveRange(0, excess);
        }
    }
}
