using MLModelBuilderAPIs.Data;
using MLModelBuilderAPIs.Repos;

namespace MLModelBuilderAPIs.Services;

public class UnitOfWork : IUnitOfWork
{
    private readonly MLModelBuilderDbContext _mlModelBuilderDbContext;
    public UnitOfWork(
        MLModelBuilderDbContext mlModelBuilderDbContext)
    {
        _mlModelBuilderDbContext = mlModelBuilderDbContext;
    }

    public IDataFieldRepo DataFieldRepo => new DataFieldRepo(_mlModelBuilderDbContext);
    public IMLModelRepo MLModelRepo => new MLModelRepo(_mlModelBuilderDbContext);
    public IExtractedDataRepo ExtractedDataRepo => new ExtractedDataRepo(_mlModelBuilderDbContext);
    public IUploadedDocRepo UploadedDocRepo => new UploadedDocRepo(_mlModelBuilderDbContext);
    public IModelBuilderUserRepo ModelBuilderUserRepo => new ModelBuilderUserRepo(_mlModelBuilderDbContext);
    public ILLMRepo LLMRepo => new LLMRepo(_mlModelBuilderDbContext);
    public IExtractionSetupRepo ExtractionSetupRepo => new ExtractionSetupRepo(_mlModelBuilderDbContext);
    public ITableMetadataRepo TableMetadataRepo => new TableMetadataRepo(_mlModelBuilderDbContext);
    public ITableHeaderRepo TableHeaderRepo => new TableHeaderRepo(_mlModelBuilderDbContext);
    public IFieldSetupRepo FieldSetupRepo => new FieldSetupRepo(_mlModelBuilderDbContext);



    public async Task<bool> SaveAsync(bool checkHasChanges = false)
    {
        // Check change tracker first 
        if (checkHasChanges)
        {
            return _mlModelBuilderDbContext.ChangeTracker.HasChanges()
                ? await _mlModelBuilderDbContext.SaveChangesAsync() > 0
                : true;
        }

        // Save changes without checking change tracker
        return await _mlModelBuilderDbContext.SaveChangesAsync() > 0;
    }

    public bool HasChanges()
    {
        return _mlModelBuilderDbContext.ChangeTracker.HasChanges();
    }
}