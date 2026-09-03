namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Helpers;

/// <summary>
/// Thread-safe set of connector families that have a dedicated brand SVG asset.
/// Populated at startup and used to decide whether a family can use
/// <c>/brand-img/&lt;family&gt;.svg</c> or should fall back to the default icon.
/// </summary>
public sealed class CamelIconAvailability
{
    private readonly HashSet<string> _families = new(StringComparer.OrdinalIgnoreCase);
    private readonly ReaderWriterLockSlim _lock = new();

    /// <summary>
    /// Adds a family to the available set.
    /// </summary>
    public void Add(string family)
    {
        if (string.IsNullOrWhiteSpace(family))
        {
            return;
        }

        _lock.EnterWriteLock();
        try
        {
            _families.Add(family.ToLowerInvariant());
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    /// <summary>
    /// Returns true when the family has a dedicated brand SVG asset.
    /// </summary>
    public bool Contains(string family)
    {
        if (string.IsNullOrWhiteSpace(family))
        {
            return false;
        }

        _lock.EnterReadLock();
        try
        {
            return _families.Contains(family.ToLowerInvariant());
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    /// <summary>
    /// Clears the set.
    /// </summary>
    public void Clear()
    {
        _lock.EnterWriteLock();
        try
        {
            _families.Clear();
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }
}
