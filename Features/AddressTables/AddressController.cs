namespace AccountsAPIs.Controllers;

[Route("address")]
[ApiController]
[Authorize]
public class AddressController : BaseApiController
{
    private readonly IAddressService _addressService;

    public AddressController(IAddressService addressService)
    {
        _addressService = addressService;
    }

    // Gets a list of addresses
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AddressDto>>>> GetAddressList()
    {
        return ResultHelper(await _addressService.GetAddressListAsync());
    }

    // Gets a specific address by its ID
    [HttpGet("{addressId}")]
    public async Task<ActionResult<ServiceResponse<AddressDto>>> GetAddressById(Guid addressId)
    {
        return ResultHelper(await _addressService.GetAddressByIdAsync(addressId));
    }

    // Creates a new address
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AddressDto>>> InsertAddress([FromBody] AddressDto addressDto)
    {
        return ResultHelper(await _addressService.InsertAddressAsync(addressDto));
    }

    // Updates an existing address
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AddressDto>>> UpdateAddress([FromBody] AddressDto addressDto)
    {
        return ResultHelper(await _addressService.UpdateAddressAsync(addressDto));
    }

    // Deletes an address by its ID
    [HttpDelete("{addressId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAddress(Guid addressId)
    {
        return ResultHelper(await _addressService.DeleteAddressAsync(addressId));
    }
}
