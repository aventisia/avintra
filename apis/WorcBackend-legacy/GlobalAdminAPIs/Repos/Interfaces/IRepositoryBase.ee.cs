namespace GlobalAdminAPIs.Repos;

public interface IRepositoryBase<TEntity, TDbContext> where TEntity : class where TDbContext : DbContext
{
    /// <summary>
    /// Get all records of entity from database without any condition
    /// </summary>
    /// <returns>All records of entity</returns>
    IQueryable<TEntity> GetAllAsync();

    /// <summary>
    /// Get IQueryable record/records of entity using condition. 
    /// We can use FirstOrDefault/SingleOrDefault/ToList inside service
    /// </summary>
    /// <param name="expression">where condition</param>
    /// <returns>IQueryable record/records of entity</returns>
    IQueryable<TEntity> GetByConditionAsync(Expression<Func<TEntity, bool>> whereCondition);

    /// <summary>
    /// Create a new record of TEntity in the database
    /// </summary>
    /// <param name="entity">new instance of TEntity</param>
    Task InsertAsync(TEntity entity);

    /// <summary>
    /// Create a new records of TEntity in the database
    /// </summary>
    /// <param name="entityList">list of new instance of TEntity</param>
    Task InsertAsync(IEnumerable<TEntity> entityList);

    /// <summary>
    /// Update an record of TEntity in the database
    /// </summary>
    /// <param name="entity">existing instance of TEntity with new (expected) data</param>
    void Update(TEntity entity);

    /// <summary>
    /// Update an records of TEntity in the database
    /// </summary>
    /// <param name="entityList">list of existing instance of TEntity with new (expected) data</param>
    void Update(IEnumerable<TEntity> entityList);

    /// <summary>
    /// Delete a single record of TEntity in the database
    /// Delete with caution. Cascading is enabled and will delete the dependent entities (if current one is Principle/Parent entiy) from the database at the same time.
    /// </summary>
    /// <param name="entity">existing instance of TEntity</param>
    void Delete(TEntity entity);

    /// <summary>
    /// Delete a records of TEntity in the database
    /// Cascading is enabled and will delete the Entity ref records from the database at the same time. Use with caution.
    /// </summary>
    /// <param name="entityList">list of existing instances of TEntity</param>
    void Delete(IEnumerable<TEntity> entityList);

    /// <summary>
    /// Detaches the specified entity from the context.
    /// </summary>
    /// <param name="entity">The entity to detach.</param>
    void Detach(TEntity entity);

    /// <summary>
    /// Checks if count of dependent entities is greater than zero or not for the parent TEntity
    /// Try to use this very less frequently as it can have performance implications
    /// </summary>
    /// <param name="whereCondition">where condition</param>
    Task<bool> DoesDependentEntitiesExistAsync(Expression<Func<TEntity, bool>> whereCondition);
}