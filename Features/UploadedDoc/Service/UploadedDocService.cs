namespace MLModelBuilderAPIs.Services;

public class UploadedDocService : IUploadedDocService
{
    #region Fields
    private readonly ILogger<UploadedDocService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    #endregion

    #region Constructors

    public UploadedDocService(
        ILogger<UploadedDocService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    #endregion

    #region Methods
    // Get the list of uploaded docs
    public async Task<ServiceResponse<IEnumerable<UploadedDocDto>>> GetUploadedDocListAsync(Guid mlModelId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<UploadedDocDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get uploaded docs
            var docs = await _unitOfWork.UploadedDocRepo
                .GetByConditionAsync(d => d.MLModelId == mlModelId).OrderBy(d => d.CreatedOn)
                .ToListAsync();

            // Task successful
            serviceResponse.Data = docs.Adapt<IEnumerable<UploadedDocDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Docs retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Inserts an uploaded docs
    public async Task<ServiceResponse<IEnumerable<UploadedDocDto>>> InsertUploadedDocsAsync(IEnumerable<UploadedDocDto> docList)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<UploadedDocDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            var documentlist = new List<UploadedDoc>();

            foreach (var doc in docList)
            {
                if (doc.File == null)
                {
                    _logger.LogInformation($"File not found.");
                    serviceResponse.Message = "File not found.";
                    return serviceResponse;
                }

                var newDoc = doc.Adapt<UploadedDoc>();
                newDoc.CreatedByUserId = _userId;
                newDoc.LastModifiedByUserId = _userId;
                newDoc.Size = doc.File.Length;
                newDoc.Type = doc.File.ContentType;

                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "UploadedDocs");

                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                newDoc.Name = $"{Path.GetFileNameWithoutExtension(doc.File.FileName)}_{DateTime.Now:ddMMyyhhmmss}{Path.GetExtension(doc.File.FileName)}";
                newDoc.Path = Path.Combine(folderPath, newDoc.Name);

                using (var fileStream = new FileStream(doc.Path, FileMode.Create))
                {
                    await doc.File.CopyToAsync(fileStream);
                }

                documentlist.Add(newDoc);

            }

            await _unitOfWork.UploadedDocRepo.InsertAsync(documentlist);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting a data field.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = documentlist.Adapt<IEnumerable<UploadedDocDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Documents uploaded successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    #endregion
}