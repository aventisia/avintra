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

    public IAIProjectRepo AIProjectRepo => new AIProjectRepo(_mlModelBuilderDbContext);
    public IExtractedDataRepo ExtractedDataRepo => new ExtractedDataRepo(_mlModelBuilderDbContext);
    public IVersionResourceRepo VersionResourceRepo => new VersionResourceRepo(_mlModelBuilderDbContext);
    public IModelBuilderUserRepo ModelBuilderUserRepo => new ModelBuilderUserRepo(_mlModelBuilderDbContext);
    public IScheduledModelRepo ScheduledModelRepo => new ScheduledModelRepo(_mlModelBuilderDbContext);
    public IFineTuningLogRepo FineTuningLogRepo => new FineTuningLogRepo(_mlModelBuilderDbContext);
    public IAIProjectApiKeyRepo AIProjectApiKeyRepo => new AIProjectApiKeyRepo(_mlModelBuilderDbContext);
    public IVersionTaskRepo VersionTaskRepo => new VersionTaskRepo(_mlModelBuilderDbContext);
    public IConversationalModelRepo ConversationalModelRepo => new ConversationalModelRepo(_mlModelBuilderDbContext);
    public IGenerativeModelRepo GenerativeModelRepo => new GenerativeModelRepo(_mlModelBuilderDbContext);
    public IAIProjectVersionRepo AIProjectVersionRepo => new AIProjectVersionRepo(_mlModelBuilderDbContext);
    public IMLModelTemplateRepo MLModelTemplateRepo => new MLModelTemplateRepo(_mlModelBuilderDbContext);
    public IAIProjectUserRepo AIProjectUserRepo => new AIProjectUserRepo(_mlModelBuilderDbContext);
    public IConversationHistoryRepo ConversationHistoryRepo => new ConversationHistoryRepo(_mlModelBuilderDbContext);


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