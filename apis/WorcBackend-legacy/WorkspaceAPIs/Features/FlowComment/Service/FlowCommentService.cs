namespace WorkspaceAPIs.Services;

public class FlowCommentService : IFlowCommentService
{
    private readonly ILogger<FlowCommentService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public FlowCommentService(
        ILogger<FlowCommentService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Gets list of flow comments of single flow using flow Id.
    public async Task<ServiceResponse<IEnumerable<FlowCommentDto>>> GetFlowCommentsAsync(Guid flowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowCommentDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get flow comments
            var flowComments = await _unitOfWork.FlowCommentRepo
                .GetByConditionAsync(w => w.Flow.Id == flowId && !w.IsDisabled)
                .OrderBy(o => o.CreatedOn)
                .ProjectToType<FlowCommentDto>()
                .ToListAsync();

            // Task successful
            serviceResponse.Data = flowComments.Adapt<IEnumerable<FlowCommentDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Comments retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Creates a new flow commment
    public async Task<ServiceResponse<FlowCommentDto>> InsertFlowCommentAsync(FlowCommentDto flowCommentDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowCommentDto>
        {
            Data = null,
            Message = "Failed to add comment. Please try again"
        };

        try
        {
            // Trim dto' string props
            flowCommentDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowCommentDto);

            // Default mapping
            var newFlowComment = flowCommentDto.Adapt<FlowComment>();
            newFlowComment.UserId = _userId;

            // Insert flow comment
            await _unitOfWork.FlowCommentRepo.InsertAsync(newFlowComment);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newFlowComment.Adapt<FlowCommentDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Comment added successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Update the flow comment with IsEdited flag
    public async Task<ServiceResponse<FlowCommentDto>> UpdateFlowCommentAsync(FlowCommentDto flowCommentDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowCommentDto>
        {
            Data = null,
            Message = "Failed to update comment. Please try again"
        };

        try
        {
            // Validate flow comment existence
            var flowComment = await _unitOfWork.FlowCommentRepo
                .GetByConditionAsync(w => w.Id == flowCommentDto.Id && w.UserId == _userId)
                .SingleOrDefaultAsync();

            // Flow comment does not exist
            if (flowComment == null)
            {
                serviceResponse.Message = "Comment does not exist";
                return serviceResponse;
            }

            // Trim dto' string props
            flowCommentDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowCommentDto);

            // Manual mapping - auto mapping is not required
            flowComment.Comment = flowCommentDto.Comment;
            flowComment.LastModifiedOn = DateTimeOffset.UtcNow;
            flowComment.IsEdited = true;

            // Update flow comment
            _unitOfWork.FlowCommentRepo.Update(flowComment);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = flowComment.Adapt<FlowCommentDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Comment updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes flow comment permanently
    public async Task<ServiceResponse<bool>> DeleteFlowCommentAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete comment. Please try again"
        };

        try
        {
            // Validate flow comment existence
            var flowComment = await _unitOfWork.FlowCommentRepo
                .GetByConditionAsync(w => w.Id == id && w.UserId == _userId)
                .SingleOrDefaultAsync();

            // Flow comment does not exist
            if (flowComment == null)
            {
                serviceResponse.Message = "Comment does not exist";
                return serviceResponse;
            }

            // Delete flow comment
            _unitOfWork.FlowCommentRepo.Delete(flowComment);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Comment deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

}