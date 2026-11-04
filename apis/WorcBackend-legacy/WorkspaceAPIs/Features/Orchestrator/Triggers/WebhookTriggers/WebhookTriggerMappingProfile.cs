namespace WorkspaceAPIs.MappingProfiles;

public class WebhookTriggerMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping: Trigger entity → WebhookTriggerDto
        config.NewConfig<Trigger, WebhookTriggerDto>()
            .AfterMapping((src, dest) =>
            {
                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
                };
                jsonOptions.Converters.Add(new JsonStringEnumConverter());

                var model = System.Text.Json.JsonSerializer.Deserialize<WebhookTriggerModel>(
                    src.Metadata.RootElement.GetRawText(), jsonOptions);

                if (model != null)
                {
                    dest.ExpectedPayloadSchema = model.ExpectedPayloadSchema;
                    dest.CallbackUrl = model.CallbackUrl;
                }
            })
            .Map(dest => dest.Agent,
                src => src.TriggerFlowVersions != null
                    ? src.TriggerFlowVersions
                        .Select(s => new AgentInfoDto()
                        {
                            Id = s.FlowVersion.Id,
                            Name = s.FlowVersion.Flow.Name,
                            VersionNumber = s.FlowVersion.VersionNumber
                        })
                        .FirstOrDefault()
                    : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                    ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                    : null)
            .Map(dest => dest.LastModifiedBy,
                src => src.LastModifiedByUser != null
                    ? src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName
                    : null);

        // Mapping: WebhookTriggerDto → Trigger entity (create/update)
        config.NewConfig<WebhookTriggerDto, Trigger>()
            .Map(dest => dest.Timezone, src => string.Empty)
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.Metadata)
            .IgnoreNullValues(true);
    }
}
