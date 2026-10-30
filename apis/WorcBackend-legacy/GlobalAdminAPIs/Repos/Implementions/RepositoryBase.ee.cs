namespace GlobalAdminAPIs.Repos;

public class RepositoryBase<TEntity, TDbContext> : IRepositoryBase<TEntity, TDbContext> where TEntity : class where TDbContext : DbContext
{
    protected readonly TDbContext _tDbContext;

    public RepositoryBase(TDbContext tDbContext)
    {
        _tDbContext = tDbContext;
    }

    public virtual IQueryable<TEntity> GetAllAsync() =>
        _tDbContext.Set<TEntity>().AsNoTracking();

    public virtual IQueryable<TEntity> GetByConditionAsync(
        Expression<Func<TEntity, bool>> whereCondition) =>
        _tDbContext.Set<TEntity>().Where(whereCondition).AsNoTracking();


    public async virtual Task InsertAsync(TEntity entity) =>
        await _tDbContext.Set<TEntity>().AddAsync(entity);

    public async virtual Task InsertAsync(IEnumerable<TEntity> entityList) =>
        await _tDbContext.Set<TEntity>().AddRangeAsync(entityList);

    public virtual void Update(TEntity entity) =>
        _tDbContext.Set<TEntity>().Update(entity);

    public virtual void Update(IEnumerable<TEntity> entityList) =>
        _tDbContext.Set<TEntity>().UpdateRange(entityList);

    public virtual void Delete(TEntity entity) =>
        _tDbContext.Set<TEntity>().Remove(entity);

    public virtual void Delete(IEnumerable<TEntity> entityList) =>
        _tDbContext.Set<TEntity>().RemoveRange(entityList);

    public virtual void Detach(TEntity entity) =>
        _tDbContext.Entry(entity).State = EntityState.Detached;

    public async virtual Task<bool> DoesDependentEntitiesExistAsync(
        Expression<Func<TEntity, bool>> whereCondition) =>
        await _tDbContext.Set<TEntity>().Where(whereCondition).CountAsync() > 0;
}