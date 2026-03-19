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
                    dest.ApiKeyExpiryDays = model.ApiKeyExpiryDays;
                    dest.ApiKeyExpiry = model.ApiKeyExpiry;
                    dest.ExpectedPayloadSchema = model.ExpectedPayloadSchema;
                    dest.CallbackUrl = model.CallbackUrl;
                }

                // Never expose the hash in any response
                dest.ApiKeyHash = null;
                dest.ApiKey = null;

                // Map single agent from TriggerFlowVersions
                dest.AgentId = src.TriggerFlowVersions != null && src.TriggerFlowVersions.Any()
                    ? src.TriggerFlowVersions.First().FlowVersionId
                    : (Guid?)null;
            })
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
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .Ignore(dest => dest.TenantId)
            .Ignore(dest => dest.Metadata)
            .IgnoreNullValues(true);
    }
}
