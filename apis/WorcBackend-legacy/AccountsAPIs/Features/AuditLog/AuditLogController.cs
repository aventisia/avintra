namespace AccountsAPIs.Controllers;

[Route("audit-log")]
[ApiController]
[Authorize]

public class AuditLogController : BaseApiController
{
    private readonly IAuditLogService _auditLogService;
    public AuditLogController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    // Insert a plan
    [HttpPost("insert-log")]
    public async Task<ActionResult<ServiceResponse<AuditLogDto>>> InsertLog([FromBody] AuditLogDto auditLogDto)
    {
        return ResultHelper(await _auditLogService.InsertLogAsync(auditLogDto));
    }

    // Delete log by Id
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteLog(Guid id)
    {
        return ResultHelper(await _auditLogService.DeleteLogAsync(id));
    }
}