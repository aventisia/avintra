namespace AccountsAPIs.Controllers;

[Route("contact-us")]
[ApiController]
[Authorize]
public class ContactUsController(IContactUsService contactUsService) : BaseApiController
{
    private readonly IContactUsService _contactUsService = contactUsService;

    // Retrieves a specific contact us record by its ID.
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<ContactUsDto>>> GetContactUs(Guid id)
    {
        return ResultHelper(await _contactUsService.GetContactUsAsync(id));
    }

    // Retrieves a list of contact us records.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ContactUsDto>>>> GetContactUsList()
    {
        return ResultHelper(await _contactUsService.GetContactUsListAsync());
    }

    // Inserts a new contact us record. Since contact us form is public we are not returning the inserted record in the response.
    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<bool>>> InsertContactUs([FromBody] ContactUsDto contactUsDto)
    {
        return ResultHelper(await _contactUsService.InsertContactUsAsync(contactUsDto));
    }

    // Updates an existing contact us record.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ContactUsDto>>> UpdateContactUs([FromBody] ContactUsDto contactUsDto)
    {
        return ResultHelper(await _contactUsService.UpdateContactUsAsync(contactUsDto));
    }

    // Deletes a contact us record by its ID.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteContactUs(Guid id)
    {
        return ResultHelper(await _contactUsService.DeleteContactUsAsync(id));
    }
}