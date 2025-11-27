// namespace WorkspaceAPIs.Features.CloudConnectors;

// public class CloudConnectorsService : ICloudConnectorsService
// {
//     private readonly IUnitOfWork _unitOfWork;
//     private readonly ILogger<CloudConnectorsService> _logger;
//     private readonly IStringEncryptionService _stringEncryptionService;

//     public CloudConnectorsService(
//         IUnitOfWork unitOfWork,
//         ILogger<CloudConnectorsService> logger,
//         IStringEncryptionService stringEncryptionService)
//     {
//         _unitOfWork = unitOfWork;
//         _logger = logger;
//         _stringEncryptionService = stringEncryptionService;
//     }

//     public async Task<VaultCredentialObj?> GetCredentialFromVaultAsync(Guid credentialId)
//     {
//         try
//         {
//             // Fetch the credential entity along with its encrypted key-value pairs
//             var vaultCredential = await _unitOfWork.AppSecretRepo
//                 .GetByConditionAsync(w => w.Id == credentialId && !w.IsDisabled)
//                 .AsNoTracking()
//                 .Include(i => i.EncryptedKeyValues)
//                 .FirstOrDefaultAsync();
//             if (vaultCredential == null) return null;
            
//             // Decrypt and merge key-value pairs into the VaultCredentialObj's data object
//             var decryptedData = new Dictionary<string, string>();
//             foreach (var kvp in vaultCredential.EncryptedKeyValues)
//             {
//                 var decryptedValue = _stringEncryptionService.DecryptString(kvp.Value);
//                 decryptedData[kvp.Name] = decryptedValue;
//             }

//             // Replace the key-value pairs in the Data property where key matches (if vaultCredential is not null then Data property will not be null)
//             var dataDict = new Dictionary<string, object>();
//             if (!string.IsNullOrEmpty(vaultCredential.Data))
//             {
//                 dataDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(vaultCredential.Data) ?? new Dictionary<string, object>();
//             }
//             foreach (var kvp in decryptedData)
//             {
//                 if (dataDict.ContainsKey(kvp.Key)) dataDict[kvp.Key] = kvp.Value;
//             }

//             // Return the VaultCredentialObj
//             return new VaultCredentialObj
//             {
//                 Name = vaultCredential.Name,
//                 Type = vaultCredential.Type,
//                 Data = dataDict
//             };
//         }
//         catch (Exception ex)
//         {
//             _logger.LogError(ex, "An error occurred while retrieving Credential with ID: {CredentialId}", credentialId);
//         }

//         return null;
//     }
// }
