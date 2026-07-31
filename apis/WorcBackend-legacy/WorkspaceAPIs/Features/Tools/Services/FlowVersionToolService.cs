namespace WorkspaceAPIs.Services;

public class FlowVersionToolService : IFlowVersionToolService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<FlowVersionToolService> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly Guid _currentUserId;

    public FlowVersionToolService(
        IUnitOfWork unitOfWork,
        ILogger<FlowVersionToolService> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _currentUserId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves all tool links for a given flow version.
    public async Task<ServiceResponse<IEnumerable<FlowVersionToolDto>>> GetFlowVersionToolsAsync(Guid flowVersionId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<FlowVersionToolDto>>
        {
            Message = "Failed to fetch flow version tools."
        };

        try
        {
            // Fetch all tool links for the given flow version, including related tools.
            var flowVersionToolLinks = await _unitOfWork.FlowVersionToolRepo
                .GetByConditionAsync(w => w.FlowVersionId == flowVersionId)
                .Include(i => i.Tool)
                .ToListAsync();

            return serviceResponse.Update(
                "Flow version tools retrieved successfully.",
                200,
                flowVersionToolLinks.Adapt<IEnumerable<FlowVersionToolDto>>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch flow version tools for {FlowVersionId}.", flowVersionId);
        }

        return serviceResponse;
    }

    // Links a tool to a flow version.
    public async Task<ServiceResponse<FlowVersionToolDto>> LinkToolToFlowVersionAsync(FlowVersionToolDto flowVersionToolDto)
    {
        var serviceResponse = new ServiceResponse<FlowVersionToolDto>
        {
            Message = "Failed to link tool to flow version."
        };

        try
        {
            // Prevent duplicate links between the same flow version and tool.
            var duplicateLink = await _unitOfWork.FlowVersionToolRepo
                .GetByConditionAsync(w =>
                    w.FlowVersionId == flowVersionToolDto.FlowVersionId &&
                    w.ToolId == flowVersionToolDto.ToolId)
                .SingleOrDefaultAsync();

            if (duplicateLink != null)
            {
                return serviceResponse.Update("Tool is already linked to this flow version.", 409);
            }

            // Create and persist the new link with audit information.
            var createdLink = flowVersionToolDto.Adapt<FlowVersion_Tool>();
            createdLink.CreatedByUserId = _currentUserId;

            await _unitOfWork.FlowVersionToolRepo.InsertAsync(createdLink);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save tool link for flow version {FlowVersionId}.", flowVersionToolDto.FlowVersionId);
                return serviceResponse;
            }

            return serviceResponse.Update(
                "Tool linked to flow version successfully.",
                200,
                createdLink.Adapt<FlowVersionToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to link tool to flow version.");
        }

        return serviceResponse;
    }

    // Updates an existing tool link for a flow version.
    public async Task<ServiceResponse<FlowVersionToolDto>> UpdateFlowVersionToolAsync(FlowVersionToolDto flowVersionToolDto)
    {
        var serviceResponse = new ServiceResponse<FlowVersionToolDto>
        {
            Message = "Failed to update flow version tool link."
        };

        try
        {
            // Fetch the existing tool link.
            var linkToUpdate = await _unitOfWork.FlowVersionToolRepo
                .GetByConditionAsync(w => w.Id == flowVersionToolDto.Id)
                .SingleOrDefaultAsync();

            if (linkToUpdate == null)
            {
                return serviceResponse.Update("Flow version tool link not found.", 404);
            }

            // Update allowed operations and credential override.
            linkToUpdate.AllowedOperations = flowVersionToolDto.AllowedOperations;
            linkToUpdate.CredentialId = flowVersionToolDto.CredentialId;

            _unitOfWork.FlowVersionToolRepo.Update(linkToUpdate);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to update flow version tool link {LinkId}.", flowVersionToolDto.Id);
                return serviceResponse;
            }

            return serviceResponse.Update(
                "Flow version tool link updated successfully.",
                200,
                linkToUpdate.Adapt<FlowVersionToolDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update flow version tool link {LinkId}.", flowVersionToolDto.Id);
        }

        return serviceResponse;
    }

    // Deletes an existing tool link from a flow version.
    public async Task<ServiceResponse<bool>> DeleteFlowVersionToolAsync(Guid linkId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow version tool link."
        };

        try
        {
            // Fetch the tool link to delete.
            var linkToDelete = await _unitOfWork.FlowVersionToolRepo
                .GetByConditionAsync(w => w.Id == linkId)
                .SingleOrDefaultAsync();

            if (linkToDelete == null)
            {
                return serviceResponse.Update("Flow version tool link not found.", 404);
            }

            // Remove the tool link.
            _unitOfWork.FlowVersionToolRepo.Delete(linkToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to delete flow version tool link {LinkId}.", linkId);
                return serviceResponse;
            }

            return serviceResponse.Update("Flow version tool link deleted successfully.", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete flow version tool link {LinkId}.", linkId);
        }

        return serviceResponse;
    }
}
