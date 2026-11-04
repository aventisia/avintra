namespace GlobalAdminAPIs.Services;

public interface IUnitOfWork
{
    IOnPremTenantRepo OnPremTenantRepo { get; }
    IOnPremInstanceRepo OnPremInstanceRepo { get; }
    IOnPremInstanceDataRepo OnPremInstanceDataRepo { get; }

   /// <summary>
    /// Saves the changes made in the unit of work asynchronously.
    /// </summary>
    /// <param name="checkHasChanges">Optional. Specifies whether to check if there are any changes before saving. Default is false.</param>
    /// <returns>A task representing the asynchronous save operation. The task result is a boolean indicating whether the save operation was successful.</returns>
    Task<bool> SaveAsync(bool checkHasChanges = false);

    /// <summary>
    /// Checks if there are any pending changes in the unit of work.
    /// </summary>
    /// <returns>True if there are pending changes, otherwise false.</returns>
    bool HasChanges();
}