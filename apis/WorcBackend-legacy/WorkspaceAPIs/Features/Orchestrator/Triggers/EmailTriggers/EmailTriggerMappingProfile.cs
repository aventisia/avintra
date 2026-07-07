namespace WorkspaceAPIs.MappingProfiles;

public class EmailTriggerMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping: EmailTrigger entity → EmailTriggerDto  Used to retrieve a list of email triggers with audit information
        config.NewConfig<Trigger, EmailTriggerDto>()
            .AfterMapping((src, dest) =>
                {
                    // Deserialize Metadata JSON safely inside AfterMap
                    var jsonOptions = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                    };
                    jsonOptions.Converters.Add(new JsonStringEnumConverter());

                    var model = System.Text.Json.JsonSerializer.Deserialize<EmailTriggerModel>(
                        src.Metadata.RootElement.GetRawText(),
                        jsonOptions
                    );

                    if (model != null)
                    {
                        dest.Mailbox = model.Mailbox;
                        dest.Folder = model.Folder;
                        dest.ExpiryDateTime = model.ExpiryDateTime;
                        dest.ResubscribeEnabled = model.ResubscribeEnabled;
                        dest.ResubscribeFrequency = model.ResubscribeFrequency;
                        dest.SubscriptionId = model.SubscriptionId;
                        dest.CredentialId = model.CredentialId;
                        dest.Provider = model.Provider;
                        dest.ApiKey = !string.IsNullOrEmpty(model.ApiKey) && model.ApiKey.Length > 4 ? model.ApiKey[..4] + "*******" : model.ApiKey; ;
                    }
                }
            )
            .Map(dest => dest.Agents,
                src => src.TriggerFlowVersions != null
                    ? src.TriggerFlowVersions.Select(s => new AgentInfoDto()
                    {
                        Id = s.FlowVersion.Id,
                        Name = s.FlowVersion.Flow.Name,
                        VersionNumber = s.FlowVersion.VersionNumber
                    }).ToList()
                    : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping to get agent list
        config.NewConfig<TriggerFlowVersion, AssignAgentTriggerDto>()
             .Map(dest => dest.Id, src => src.FlowVersion != null ? src.FlowVersion.Id : Guid.Empty)
           .Map(dest => dest.Name, src => src.FlowVersion != null ? src.FlowVersion.Flow.Name : null)
            .Map(dest => dest.VersionNumber, src => src.FlowVersion != null ? src.FlowVersion.VersionNumber : 0)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null)
            .Map(dest => dest.CreatedByUserInitials,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName.First() + "" + src.CreatedByUser.LastName.First()
                    : null);

        // Mapping: EmailTriggerDto → EmailTrigger entity Used for creating or updating email triggers Ignores system-generated fields and null values
        config.NewConfig<EmailTriggerDto, Trigger>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);
    }
}