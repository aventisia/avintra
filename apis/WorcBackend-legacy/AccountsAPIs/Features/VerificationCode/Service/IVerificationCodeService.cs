namespace AccountsAPIs.Services;

public interface IVerificationCodeService
{
    /// <summary>
    /// Checks the verification code for the provided username and request type.
    /// </summary>
    /// <param name="checkVerificationCodeDto">The DTO containing the information required to check the verification code.</param>
    /// <returns>A task representing the asynchronous operation. The task result contains the service response indicating whether the verification code is valid or not.</returns>
    Task<ServiceResponse<bool>> CheckVerificationCodeAsync(CheckVerificationCodeDto checkVerificationCodeDto);
}