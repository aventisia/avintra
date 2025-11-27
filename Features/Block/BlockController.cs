namespace WorkspaceAPIs.Controllers;

[Route("block")]
[ApiController]
[Authorize]
public class BlockController : BaseApiController
{
    private readonly IBlockService _blockService;

    public BlockController(IBlockService blockService)
    {
        _blockService = blockService;
    }

    // Retrieves a list of blocks associated with a specific flowVersionId.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<BlockDto>>>> GetBlocks(Guid? id)
    {
        return ResultHelper(await _blockService.GetBlocksByIdAsync(id));
    }

    // Retrieves a specific block by its unique identifier.
    [HttpGet("{blockId}")]
    public async Task<ActionResult<ServiceResponse<BlockDto>>> GetBlockById(Guid blockId)
    {
        return ResultHelper(await _blockService.GetBlockByIdAsync(blockId));
    }

    // Adds a new block.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<BlockDto>>> InsertBlock([FromBody] BlockDto blockDto)
    {
        return ResultHelper(await _blockService.InsertBlockAsync(blockDto));
    }

    // Updates an existing block.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<BlockDto>>> UpdateBlock([FromBody] BlockDto blockDto)
    {
        return ResultHelper(await _blockService.UpdateBlockAsync(blockDto));
    }

    // Deletes a block by its unique identifier.
    [HttpDelete("{blockId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteBlock(Guid blockId)
    {
        return ResultHelper(await _blockService.DeleteBlockAsync(blockId));
    }

    // Deletes multiple blocks based on their unique identifiers.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleBlocks([FromBody] IEnumerable<Guid> blockIds)
    {
        return ResultHelper(await _blockService.DeleteMultipleBlocksAsync(blockIds));
    }

    // Searches for blocks based on a search key and optional flow version identifier.
    [HttpGet("search/{searchKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchBlockDto>>>> SearchBlocks(string searchKey, Guid? agentId)
    {
        return ResultHelper(await _blockService.SearchBlocksAsync(searchKey, agentId));
    }
}
