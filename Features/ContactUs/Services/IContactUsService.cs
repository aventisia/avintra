namespace AccountsAPIs.Services;

public interface IContactUsService
{
    /// <summary>
    /// Retrieves a specific contact us record by its ID.
    /// </summary>
    /// <param name="id">The ID of the contact us record to retrieve.</param>
    /// <returns>The task result contains the service response with the retrieved contact us record.</returns>
    Task<ServiceResponse<ContactUsDto>> GetContactUsAsync(Guid id);

    /// <summary>
    /// Retrieves a list of contact us records.
    /// </summary>
    /// <returns>The task result contains the service response with the list of contact us records.</returns>
    Task<ServiceResponse<IEnumerable<ContactUsDto>>> GetContactUsListAsync();

    /// <summary>
    /// Inserts a new contact us record.
    /// </summary>
    /// <remarks>
    /// Since contact us form is public we are not returning the inserted record in the response.
    /// </remarks>
    /// <param name="contactUsDto">The data for the new contact us record.</param>
    /// <returns>The task result contains the service response indicating whether the insertion was successful.</returns>
    Task<ServiceResponse<bool>> InsertContactUsAsync(ContactUsDto contactUsDto);

    /// <summary>
    /// Updates an existing contact us record.
    /// </summary>
    /// <param name="contactUsDto">The updated data for the contact us record.</param>
    /// <returns>The task result contains the service response with the updated contact us record.</returns>
    Task<ServiceResponse<ContactUsDto>> UpdateContactUsAsync(ContactUsDto contactUsDto);

    /// <summary>
    /// Deletes a contact us record by its ID.
    /// </summary>
    /// <param name="id">The ID of the contact us record to delete.</param>
    /// <returns>The task result contains the service response indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteContactUsAsync(Guid id);
}