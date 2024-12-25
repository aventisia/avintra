namespace AccountsAPIs.MappingProfiles;

public class AuditLogMappingProfile :IRegister
{
    public void Register (TypeAdapterConfig config)
    {
        //Mapping for Insert the audit log
         config.NewConfig<AuditLogDto,AuditLog>()
         .Ignore(dest => dest.Id)
        .IgnoreNullValues(true);

        // Mapping for get audit log record.
        config.NewConfig<AuditLog,AuditLogDto>();
    }
}