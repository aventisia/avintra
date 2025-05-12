namespace MLModelBuilderAPIs.Services;

public class ExtractionSetupService : IExtractionSetupService
{
    private readonly ILogger<ExtractionSetupService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ExtractionSetupService(
        ILogger<ExtractionSetupService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Retrieve the user ID from the HTTP context and initialize the logger and unit of work
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all extraction setups created by the user
    public async Task<ServiceResponse<IEnumerable<ExtractionSetupDto>>> RetrieveAllExtractionSetupsAsync()
    {
        // Initialize the service response with a failure message and null data.
        var serviceResponse = new ServiceResponse<IEnumerable<ExtractionSetupDto>>
        {
            Data = null,
            Message = "Failed to retrieve extraction setups. Please try again."
        };

        try
        {
            // Log the attempt to fetch extraction setups for the user.
            _logger.LogInformation($"Initiating retrieval of extraction setups for user: {_userId}");

            // Fetch extraction setups associated with the user, ordered by creation date.
            var extractionSetups = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                .Include(i => i.MLModel)
                .Include(i => i.TableMetadata!)
                    .ThenInclude(i1 => i1.TableHeaders)
                .Include(i => i.FieldSetups)
                .ProjectToType<ExtractionSetupDto>()
                .ToListAsync();

            // Log the successful retrieval of extraction setups, including the count retrieved.
            _logger.LogInformation($"Successfully retrieved {extractionSetups.Count} extraction setups for user: {_userId}");

            // Assign the retrieved extraction setups to the service response's data property.
            serviceResponse.Data = extractionSetups.Adapt<IEnumerable<ExtractionSetupDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setups retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while retrieving extraction setups for user: {_userId}. Exception: {ex.Message}");
        }

        // Return the service response.
        return serviceResponse;
    }

    // Creates a new extraction setup record
    public async Task<ServiceResponse<ExtractionSetupDto>> InsertExtractionSetupAsync(ExtractionSetupDto extractionSetupDto)
    {
        // Initialize the response with a default failure message.
        var response = new ServiceResponse<ExtractionSetupDto>
        {
            Data = null,
            Message = "Failed to add extraction setup. Please try again.",
        };

        try
        {
            _logger.LogInformation("User [{UserId}] is attempting to create a new extraction setup.", _userId);

            // TODO: Validate uniqueness of extraction setup name for the user.

            // Trim and sanitize all string properties in the DTO.
            extractionSetupDto = TrimDtoStringPropsUtil.TrimDtoStringProps(extractionSetupDto);

            // Map the DTO to the entity model.
            var extractionSetupEntity = extractionSetupDto.Adapt<ExtractionSetup>();

            // Set audit fields
            extractionSetupEntity.CreatedByUserId = _userId;
            extractionSetupEntity.LastModifiedByUserId = _userId;

            // Map nested table metadata if any exist.
            if (extractionSetupDto.TableMetadata.Any())
            {
                extractionSetupEntity.TableMetadata = extractionSetupDto.TableMetadata.Select(s => new TableMetadata
                {
                    Name = s.Name,
                    Context = s.Context,
                    TableHeaders = s.TableHeaders.Select(s1 => new TableHeader
                    {
                        Name = s1.Name,
                        Type = s1.Type,
                        Instructions = s1.Instructions
                    }).ToList()
                }).ToList();
            }

            // Map field setups if any exist.
            if (extractionSetupDto.FieldSetups.Any())
            {
                extractionSetupEntity.FieldSetups = extractionSetupDto.FieldSetups.Select(field => new FieldSetup
                {
                    Name = field.Name,
                    Type = field.Type,
                    Instructions = field.Instructions
                }).ToList();
            }

            _logger.LogInformation("Inserting extraction setup into the database for user [{UserId}].", _userId);

            // Insert the new extraction setup
            await _unitOfWork.ExtractionSetupRepo.InsertAsync(extractionSetupEntity);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while creating extraction setup for user [{UserId}].", _userId);
                return response;
            }

            // Successfully saved; map back to DTO and update response
            response.Data = extractionSetupEntity.Adapt<ExtractionSetupDto>();
            response.StatusCode = 200;
            response.Message = "Extraction setup added successfully.";

            _logger.LogInformation("Extraction setup created successfully for user [{UserId}].", _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while creating extraction setup for user [{UserId}].", _userId);
        }

        return response;
    }

    // Update an existing extraction setup record
    public async Task<ServiceResponse<ExtractionSetupDto>> UpdateExtractionSetupAsync(ExtractionSetupDto extractionSetupDto)
    {
        // Initialize the service response with a failure state
        var serviceResponse = new ServiceResponse<ExtractionSetupDto>
        {
            Data = null,
            Message = "Failed to update extraction setup. Please try again."
        };

        try
        {
            _logger.LogInformation("START UpdateExtractionSetupAsync | Setup ID: {Id} | User ID: {UserId}", extractionSetupDto.Id, _userId);

            // Fetch the existing extraction setup from DB with its related tables, headers, and field setups
            var extractionSetup = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => w.Id == extractionSetupDto.Id)
                .Include(i => i.TableMetadata!)
                    .ThenInclude(i1 => i1.TableHeaders)
                .Include(i => i.FieldSetups)
                .SingleOrDefaultAsync();

            // Return if no such setup exists
            if (extractionSetup == null)
            {
                // TODO: this will remove letter
                // Try inserting a new extraction setup using the provided DTO
                var response = await InsertExtractionSetupAsync(extractionSetupDto);

                // If insertion is successful (HTTP 200), return the response
                if (response.StatusCode == 200)
                {
                    return response;
                }
                _logger.LogWarning("Extraction setup not found | ID: {Id} | User ID: {UserId}", extractionSetupDto.Id, _userId);
                serviceResponse.Message = "Extraction setup not found";
                return serviceResponse;
            }

            // Clean any extra spaces or formatting in string fields of the DTO
            extractionSetupDto = TrimDtoStringPropsUtil.TrimDtoStringProps(extractionSetupDto);

            // Map updated values from DTO to the existing entity
            _logger.LogInformation("Mapping DTO to entity | Setup ID: {Id}", extractionSetupDto.Id);
            extractionSetupDto.Adapt(extractionSetup);
            extractionSetup.LastModifiedByUserId = _userId;

            // ----------------------------- TABLE METADATA HANDLING -----------------------------
            _logger.LogInformation("Processing table metadata | Setup ID: {Id}", extractionSetupDto.Id);
            var dtoTables = extractionSetupDto.TableMetadata ?? new List<TableMetadataDto>();

            // Identify obsolete tables for deletion
            var tablesToBeDeleted = extractionSetup.TableMetadata
                .Where(existingTable => !dtoTables
                    .Any(dtoTable => dtoTable.Name == existingTable.Name && dtoTable.Context == existingTable.Context));

            if (tablesToBeDeleted.Any())
            {
                _logger.LogInformation("Deleting {Count} obsolete tables", tablesToBeDeleted.Count());
                _unitOfWork.TableMetadataRepo.Delete(tablesToBeDeleted);
            }

            // Iterate through DTO tables to add or update them
            foreach (var dtoTable in dtoTables)
            {
                var existingTable = extractionSetup.TableMetadata
                    .FirstOrDefault(t => t.Name == dtoTable.Name && t.Context == dtoTable.Context);

                if (existingTable == null)
                {
                    _logger.LogInformation("Adding new table | Name: {Name}, Context: {Context}", dtoTable.Name, dtoTable.Context);
                    extractionSetup.TableMetadata.Add(new TableMetadata
                    {
                        Name = dtoTable.Name,
                        Context = dtoTable.Context,
                        TableHeaders = dtoTable.TableHeaders.Select(h => new TableHeader
                        {
                            Name = h.Name,
                            Type = h.Type,
                            Instructions = h.Instructions
                        }).ToList()
                    });
                }
                else
                {
                    _logger.LogInformation("Updating headers for table | Name: {Name}", dtoTable.Name);
                    var dtoHeaders = dtoTable.TableHeaders ?? new List<TableHeaderDto>();

                    // Delete headers not in DTO
                    var headersToDelete = existingTable.TableHeaders
                        .Where(header => !dtoHeaders
                            .Any(dh => dh.Name == header.Name && dh.Type == header.Type));

                    if (headersToDelete.Any())
                    {
                        _logger.LogInformation("Deleting {Count} obsolete headers from table {Table}", headersToDelete.Count(), dtoTable.Name);
                        _unitOfWork.TableHeaderRepo.Delete(headersToDelete);
                    }

                    // Add or update headers
                    foreach (var dtoHeader in dtoHeaders)
                    {
                        var existingHeader = existingTable.TableHeaders
                            .FirstOrDefault(h => h.Name == dtoHeader.Name && h.Type == dtoHeader.Type);

                        if (existingHeader == null)
                        {
                            _logger.LogInformation("Adding new header | Header: {Header}, Table: {Table}", dtoHeader.Name, dtoTable.Name);
                            existingTable.TableHeaders.Add(new TableHeader
                            {
                                Name = dtoHeader.Name,
                                Type = dtoHeader.Type,
                                Instructions = dtoHeader.Instructions
                            });
                        }
                        else if (existingHeader.Instructions != dtoHeader.Instructions)
                        {
                            _logger.LogInformation("Updating instructions for header | Header: {Header}, Table: {Table}", dtoHeader.Name, dtoTable.Name);
                            existingHeader.Instructions = dtoHeader.Instructions;
                        }
                    }
                }
            }

            // ----------------------------- FIELD SETUP HANDLING -----------------------------
            _logger.LogInformation("Processing field setups | Setup ID: {Id}", extractionSetupDto.Id);
            var dtoFields = extractionSetupDto.FieldSetups ?? new List<FieldSetupDto>();

            // Remove fields not in DTO
            var fieldsToBeDeleted = extractionSetup.FieldSetups
                .Where(existingField => !dtoFields
                    .Any(dtoField => dtoField.Name == existingField.Name && dtoField.Type == existingField.Type));

            if (fieldsToBeDeleted.Any())
            {
                _logger.LogInformation("Deleting {Count} obsolete field setups", fieldsToBeDeleted.Count());
                _unitOfWork.FieldSetupRepo.Delete(fieldsToBeDeleted);
            }

            // Add or update field setups
            foreach (var dtoField in dtoFields)
            {
                var existingField = extractionSetup.FieldSetups
                    .FirstOrDefault(f => f.Name == dtoField.Name && f.Type == dtoField.Type);

                if (existingField == null)
                {
                    _logger.LogInformation("Adding new field setup | Field: {FieldName}", dtoField.Name);
                    extractionSetup.FieldSetups.Add(new FieldSetup
                    {
                        Name = dtoField.Name,
                        Type = dtoField.Type,
                        Instructions = dtoField.Instructions
                    });
                }
                else if (existingField.Instructions != dtoField.Instructions)
                {
                    _logger.LogInformation("Updating field instructions | Field: {FieldName}", dtoField.Name);
                    existingField.Instructions = dtoField.Instructions;
                }
            }

            _logger.LogInformation("Saving changes to the database | Setup ID: {Id}", extractionSetupDto.Id);
            _unitOfWork.ExtractionSetupRepo.Update(extractionSetup);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to persist updates to the database | Setup ID: {Id} | User ID: {UserId}", extractionSetupDto.Id, _userId);
                return serviceResponse;
            }

            _logger.LogInformation("Extraction setup update successful | Setup ID: {Id} | User ID: {UserId}", extractionSetupDto.Id, _userId);
            serviceResponse.Data = extractionSetup.Adapt<ExtractionSetupDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while updating extraction setup | Setup ID: {Id} | User ID: {UserId}", extractionSetupDto.Id, _userId);
        }

        return serviceResponse;
    }

    // Delete an extraction setup record
    public async Task<ServiceResponse<bool>> RemoveExtractionSetupAsync(Guid extractionSetupId)
    {
        // Initialize the service response with default failure values
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete extraction setup. Please try again."
        };

        try
        {
            // Log the start of the deletion process
            _logger.LogInformation($"Attempting to delete extraction setup with ID: {extractionSetupId} for user: {_userId}");

            // Attempt to retrieve the extraction setup by ID
            var extractionSetup = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => w.Id == extractionSetupId)
                .SingleOrDefaultAsync();

            // If not found, log a warning and return an appropriate message
            if (extractionSetup == null)
            {
                _logger.LogWarning($"Extraction setup with ID {extractionSetupId} not found for user: {_userId}");
                serviceResponse.Message = "Extraction setup does not exist.";
                return serviceResponse;
            }

            // Proceed to delete the found extraction setup
            _logger.LogInformation($"Deleting extraction setup with ID: {extractionSetupId} for user: {_userId}");
            _unitOfWork.ExtractionSetupRepo.Delete(extractionSetup);

            // Attempt to persist the deletion in the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to delete extraction setup with ID {extractionSetupId} for user: {_userId} during save.");
                return serviceResponse;
            }

            // Log successful deletion
            _logger.LogInformation($"Successfully deleted extraction setup with ID {extractionSetupId} for user: {_userId}");

            // Update service response to reflect success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error occurred while deleting extraction setup with ID {extractionSetupId} for user: {_userId}. Exception: {ex.Message}");
        }

        // Return the final service response
        return serviceResponse;
    }

    // Delete multiple extraction setup records
    public async Task<ServiceResponse<bool>> RemoveMultipleExtractionSetupAsync(IEnumerable<Guid> extractionSetupIds)
    {
        // Initialize the service response with default failure values
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete extraction setups. Please try again."
        };

        try
        {
            // Log the start of the batch deletion process
            _logger.LogInformation($"Attempting to delete {extractionSetupIds.Count()} extraction setups for user: {_userId}");

            // Retrieve all extraction setups that match the provided IDs
            var extractionSetups = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => extractionSetupIds.Contains(w.Id))
                .ToListAsync();

            // If none of the requested setups were found, return early
            if (!extractionSetups.Any())
            {
                serviceResponse.Message = "No extraction setups were found to delete.";
                return serviceResponse;
            }

            // Delete the found extraction setups
            _unitOfWork.ExtractionSetupRepo.Delete(extractionSetups);

            // Attempt to save the changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to delete extraction setups for user: {_userId} during save.");
                return serviceResponse;
            }

            // Log successful deletion
            _logger.LogInformation($"Successfully deleted {extractionSetups.Count} extraction setups for user: {_userId}");

            // Set success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setups deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while deleting multiple extraction setups for user: {_userId}. Exception: {ex.Message}");
        }

        return serviceResponse;
    }

    // Retrieves an extraction setup by its identifier
    public async Task<ServiceResponse<ExtractionSetupDto>> RetrieveExtractionSetupByIdAsync(Guid extractionSetupId)
    {
        // Initialize the service response with a default failure message and null data
        var serviceResponse = new ServiceResponse<ExtractionSetupDto>
        {
            Data = null,
            Message = "Failed to retrieve extraction setup. Please try again."
        };

        try
        {
            // Log the start of the retrieval process
            _logger.LogInformation($"Attempting to retrieve extraction setup with ID: {extractionSetupId}");

            // Attempt to fetch the extraction setup by ID and map it to a DTO
            var extractionSetup = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => w.Id == extractionSetupId)
                .Include(i => i.MLModel)
                .Include(i => i.TableMetadata!)
                    .ThenInclude(i1 => i1.TableHeaders)
                .Include(i => i.FieldSetups)
                .ProjectToType<ExtractionSetupDto>()
                .SingleOrDefaultAsync();

            // If the setup is not found, log a warning and return an appropriate message
            if (extractionSetup == null)
            {
                _logger.LogWarning($"Extraction setup with ID {extractionSetupId} not found");
                serviceResponse.Message = "Extraction setup does not exist.";
                return serviceResponse;
            }

            // Log successful retrieval
            _logger.LogInformation($"Extraction setup with ID {extractionSetupId} retrieved successfully");

            // Populate the successful response
            serviceResponse.Data = extractionSetup;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving extraction setup with ID {extractionSetupId}. Exception: {ex.Message}");
        }

        // Return the final service response
        return serviceResponse;
    }
}
