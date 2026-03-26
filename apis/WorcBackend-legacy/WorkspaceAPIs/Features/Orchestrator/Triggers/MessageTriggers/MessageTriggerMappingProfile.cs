namespace WorkspaceAPIs.MappingProfiles;

public class MessageTriggerMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping: Trigger entity → MessageTriggerDto Used to retrieve a list of message triggers with audit information
        config.NewConfig<Trigger, MessageTriggerDto>()
            .AfterMapping((src, dest) =>
            {
                // Deserialize Metadata JSON safely inside AfterMap
                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                };
                jsonOptions.Converters.Add(new JsonStringEnumConverter());

                var model = System.Text.Json.JsonSerializer.Deserialize<MessageTriggerModel>(
                    src.Metadata.RootElement.GetRawText(),
                    jsonOptions
                );

                if (model != null)
                {
                    dest.Reference = model.Reference;
                    dest.ExpiryDateTime = model.ExpiryDateTime;
                    dest.ResubscribeEnabled = model.ResubscribeEnabled;
                    dest.ResubscribeFrequency = model.ResubscribeFrequency;
                    dest.SubscriptionId = model.SubscriptionId;
                    dest.CredentialId = model.CredentialId;
                    dest.Provider = model.Provider;
                    dest.ApiKey = !string.IsNullOrEmpty(model.ApiKey) && model.ApiKey.Length > 4 ? model.ApiKey[..4] + "*******" : model.ApiKey; ;
                }
            })
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

        // Mapping: MessageTriggerDto → Trigger entity Used for creating or updating message triggers Ignores system-generated fields and null values
        config.NewConfig<MessageTriggerDto, Trigger>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .IgnoreNullValues(true);
    }
}