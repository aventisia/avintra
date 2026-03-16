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
                    dest.Mailbox = model.Mailbox;
                    dest.ExpiryDateTime = model.ExpiryDateTime;
                    dest.ResubscribeEnabled = model.ResubscribeEnabled;
                    dest.ResubscribeFrequency = model.ResubscribeFrequency;
                    dest.SubscriptionId = model.SubscriptionId;
                    dest.CredentialId = model.CredentialId;
                    dest.Provider = model.Provider;
                }
            })
            .Map(dest => dest.AgentIds,
                src => src.TriggerFlowVersions != null
                    ? src.TriggerFlowVersions.Select(s => s.FlowVersionId).ToList()
                    : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping: FlowVersion entity → AssignAgentTriggerDto Used to retrieve the list of agents assigned to a message trigger Includes audit information and initials for UI display
        config.NewConfig<FlowVersion, AssignAgentTriggerDto>()
            .Map(dest => dest.Name, src => src.Flow != null ? src.Flow.Name : null)
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