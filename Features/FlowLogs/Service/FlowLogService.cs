namespace WorkspaceAPIs.Services;

public class FlowLogService : IFlowLogService
{
   private readonly ILogger<FlowLogService> _logger;
   private readonly IUnitOfWork _unitOfWork;
   private readonly Guid _userId;

   public FlowLogService(ILogger<FlowLogService> logger,
   IUnitOfWork unitOfWork,
   IHttpContextAccessor httpContextAccessor)
   {
      // Set _userId
      _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

      _logger = logger;
      _unitOfWork = unitOfWork;
   }

   public async Task<ServiceResponse<FlowLogDto>> CreateFlowLogAsync(FlowLogDto flowLogDto)
   {
      // Initialize ServiceResponse with failed response
      var serviceResponse = new ServiceResponse<FlowLogDto>
      {
         Data = null,
         Message = "Failed to insert flow log. Please try again"
      };
      try
      {
         // Trim dto' string props
         flowLogDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowLogDto);

         // Default mapping
         var newFlowLog = flowLogDto.Adapt<FlowLog>();
         newFlowLog.CreatedByUserId = _userId;
         newFlowLog.LastModifiedByUserId = _userId;

         // Insert flow
         await _unitOfWork.flowLogRepo.InsertAsync(newFlowLog);

         // Insert-Job failed
         if (!await _unitOfWork.SaveAsync())
         {
            _logger.LogInformation("Context SaveChanges failed while inserting new flow log");
            return serviceResponse;
         }

         // Task successful
         serviceResponse.Data = newFlowLog.Adapt<FlowLogDto>();
         serviceResponse.StatusCode = 200;
         serviceResponse.Message = "Flow log created successfully";
      }
      catch (Exception ex)
      {
         _logger.LogError(ex.ToString());
         return serviceResponse;
      }

      return serviceResponse;

   }

}