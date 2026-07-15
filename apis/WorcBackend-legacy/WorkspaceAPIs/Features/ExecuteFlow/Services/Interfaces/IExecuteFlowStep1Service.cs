namespace WorkspaceAPIs.Services;

public interface IExecuteFlowStep1Service
{
    /// <summary>
    /// Endpoint to execute the flow version on web. If flow version is unpublished, 
    /// it checks all the validations to ensure only valid flow graph can be 
    /// executed. If flow version is published, it will not validate the flow 
    /// graph since published flow versions are non editable and all validation 
    /// checks should have been passed at the time of publishing.
    /// </summary>
    /// <param name="requestDto"> Contains the flow execution request details including input data and flow version reference. </param>
    /// <param name="triggerType"> Specifies how the flow is triggered (e.g., ManualTrigger or WebhookTrigger). Defaults to ManualTrigger. </param>
    Task<ServiceResponse<ExecuteFlowResponseDto>> ExecuteFlowAsync(ExecuteFlowRequestDto requestDto, TriggerTypesEnum triggerType = TriggerTypesEnum.Manual);
}
