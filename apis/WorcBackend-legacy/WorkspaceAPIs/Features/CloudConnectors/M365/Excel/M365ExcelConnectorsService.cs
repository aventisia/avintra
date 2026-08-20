namespace WorkspaceAPIs.Features.CloudConnectors.M365.Excel;

public class M365ExcelConnectorsService : IM365ExcelConnectorsService
{
    private readonly ILogger<M365ExcelConnectorsService> _logger;
    private readonly IM365ConnectorsService _m365ConnectorsService;

    public M365ExcelConnectorsService(
        ILogger<M365ExcelConnectorsService> logger,
        IM365ConnectorsService m365ConnectorsService)
    {
        _logger = logger;
        _m365ConnectorsService = m365ConnectorsService;
    }

    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto()
            {
                Response = null,
                Provider = cloudConnectorReqDto.Provider,
                Action = cloudConnectorReqDto.Action
            },
            StatusCode = 400
        };

        try
        {
            // Step 1: Get access token from M365ConnectorsService
            var accessToken = await _m365ConnectorsService.GetM365AccessTokenAsync(cloudConnectorReqDto.CredentialName);
            if (accessToken == null)
            {
                _logger.LogWarning("Failed to obtain M365 access token for Credential Name: {CredentialName}", cloudConnectorReqDto.CredentialName);
                serviceResponse.Message = "Failed to obtain M365 access token.";
                return serviceResponse;
            }

            // Step 2: Take action based on M365 Excel connector unique name
            var m365ExcelResponse = await TakeM365ExcelActionAsync(cloudConnectorReqDto.Action, accessToken, cloudConnectorReqDto.Payload);
            if (m365ExcelResponse == null)
            {
                _logger.LogWarning("M365 Excel connector action returned null response for connector: {Action}", cloudConnectorReqDto.Action);
                serviceResponse.Message = "M365 Excel connector action failed.";
                return serviceResponse;
            }

            // Step 3: Request invoked successfully
            serviceResponse.Data.Response = m365ExcelResponse;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "M365 Excel connector invoked successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Take action based on connector unique name
    private async Task<JsonDocument?> TakeM365ExcelActionAsync(string action, string accessToken, Dictionary<string, object> payload)
    {
        // Construct workbook and worksheet URLs
        string wbUrl = $"{_m365ConnectorsService.GRAPH_BASE_URL}/drives/{payload.GetValueOrDefault("driveAndItemId", "drive-id/items/item-id")}/workbook";
        string wsUrl = $"{wbUrl}/worksheets/{payload.GetValueOrDefault("worksheetName", "")}";

        switch (action)
        {
            case nameof(M365ExcelActionsEnum.AddNewWorksheet):
                {
                    var postObj = new { name = payload["newWorksheetName"].ToString()! };
                    return await HttpClientHelper.PostAsync(wsUrl, postObj, accessToken);
                }
            case nameof(M365ExcelActionsEnum.RenameWorksheet):
                {
                    var newName = payload.GetValueOrDefault("newWorksheetName", "").ToString().Trim();
                    var worksheetUrl = $"{wbUrl}/worksheets('{payload.GetValueOrDefault("worksheetName", "").ToString().Trim()}')";
                    var patchPayload = new { name = newName };

                    return await HttpClientHelper.PatchAsync(worksheetUrl, patchPayload, accessToken);
                }
            case nameof(M365ExcelActionsEnum.GetWorksheetNames):
                return await HttpClientHelper.GetAsync(wsUrl, accessToken);
            case nameof(M365ExcelActionsEnum.WriteValueToRange):
                {
                    var patchObj = new { values = JsonConvert.DeserializeObject<object>(payload["valuesToWrite"].ToString()!) };
                    return await HttpClientHelper.PatchAsync($"{wsUrl}/range(address='{payload["rangeAddress"]}')", patchObj, accessToken);
                }
            case nameof(M365ExcelActionsEnum.ReadValueFromRange):
                return await HttpClientHelper.GetAsync($"{wsUrl}/range(address='{payload["rangeAddress"]}')", accessToken);
            case nameof(M365ExcelActionsEnum.DeleteWorksheet):
                {
                    var worksheetUrl = $"{wbUrl}/worksheets('{payload.GetValueOrDefault("worksheetName", "").ToString().Trim()}')";
                    return await HttpClientHelper.DeleteAsync(worksheetUrl, accessToken);
                }
            case nameof(M365ExcelActionsEnum.SetColorInExcelWorksheet):
                {
                    var rangeAddress = payload["rangeAddress"].ToString();
                    var color = payload["color"].ToString();
                    if (!color.StartsWith("#"))
                    {
                        color = "#" + color;
                    }

                    var finalUrl = $"{wsUrl}/range(address='{rangeAddress}')/format/fill";
                    var body = new { values = color };

                    return await HttpClientHelper.PatchAsync(finalUrl, body, accessToken);
                }
            case nameof(M365ExcelActionsEnum.GetWorkbookInfo):
                {
                    var workbookUrl = $"{wbUrl}";
                    return await HttpClientHelper.GetAsync(workbookUrl, accessToken);
                }
            case nameof(M365ExcelActionsEnum.LookupRangeInExcelWorksheet):
                {
                    var rangeAddress = payload.GetValueOrDefault("rangeAddress", "").ToString().Trim();
                    var rangeUrl = $"{wsUrl}/range(address='{rangeAddress}')";
                    return await HttpClientHelper.GetAsync(rangeUrl, accessToken);
                }

            case nameof(M365ExcelActionsEnum.SelectRangeInExcelWorksheet): 
                {
                    var rangeAddress = payload.GetValueOrDefault("rangeAddress", "").ToString().Trim();
                    var rangeUrl = $"{wsUrl}/range(address='{rangeAddress}')";
                    return await HttpClientHelper.GetAsync(rangeUrl, accessToken);
                }
            default:
                _logger.LogWarning("Unsupported M365 Excel connector: {Action}", action);
                return null;
        }
    }
}