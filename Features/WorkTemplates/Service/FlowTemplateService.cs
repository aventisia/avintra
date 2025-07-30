namespace WorkspaceAPIs.Services
{
    public class WorcTemplateService : IWorcTemplateService
    {
        private readonly ILogger<WorcTemplateService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly HttpClientUrlConfig _httpClientUrlConfig;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly Guid _userId;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public WorcTemplateService(
            ILogger<WorcTemplateService> logger,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor,
            HttpClientUrlConfig httpClientUrlConfig,
            IHttpClientFactory httpClientFactory)
        {
            // Set _userId
            _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

            _logger = logger;
            _unitOfWork = unitOfWork;
            _httpClientUrlConfig = httpClientUrlConfig;
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
        }

        // Creates a new Worc template
        public async Task<ServiceResponse<WorcTemplateDto>> InsertWorcTemplateAsync(WorcTemplateDto worcTemplateDto)
        {
            // Initialize ServiceResponse with failed response
            var serviceResponse = new ServiceResponse<WorcTemplateDto>
            {
                Data = null,
                Message = "Failed to add template. Please try again"
            };
            try
            {
                // Trim dto string properties
                worcTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(worcTemplateDto);

                // Map the DTO to the entity
                var newWorcTemplate = worcTemplateDto.Adapt<WorcTemplate>();
                newWorcTemplate.CreatedByUserId = _userId;
                newWorcTemplate.LastModifiedByUserId = _userId;

                // Insert Worc template into the database
                await _unitOfWork.WorcTemplateRepo.InsertAsync(newWorcTemplate);

                // Insert-Job failed
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Context SaveChanges failed while inserting new Worc template");
                    return serviceResponse;
                }

                // Task successful
                serviceResponse.Data = newWorcTemplate.Adapt<WorcTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Template added successfully";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                serviceResponse.Message = "An error occurred while inserting the Worc template";
                return serviceResponse;
            }

            return serviceResponse;
        }

        // Retrieve Worc template by its Id
        public async Task<ServiceResponse<WorcTemplateDto>> GetWorcTemplateAsync(Guid templateId)
        {
            // Initialize ServiceResponse with failed response
            var serviceResponse = new ServiceResponse<WorcTemplateDto>
            {
                Data = null,
                Message = "Failed to get Worc template. Please try again"
            };
            try
            {
                // Try to get Worc template
                var worcTemplate = await _unitOfWork.WorcTemplateRepo.GetByConditionAsync(w => w.Id == templateId).FirstOrDefaultAsync();

                if (worcTemplate == null)
                {
                    _logger.LogError($"Worc template not found for Id {templateId}");
                    serviceResponse.Message = "Worc template does not exist";
                    return serviceResponse;
                }

                // Task successful
                serviceResponse.Data = worcTemplate.Adapt<WorcTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Worc template fetched successfully";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                serviceResponse.Message = "An error occurred while fetching Worc template";
                return serviceResponse;
            }

            return serviceResponse;
        }

        // Retrieve trending Worc templates list
        public async Task<ServiceResponse<IEnumerable<WorcTemplateDto>>> GetAllTemplatesAsync()
        {
            // Initialize ServiceResponse with failed response
            var serviceResponse = new ServiceResponse<IEnumerable<WorcTemplateDto>>
            {
                Data = null,
                Message = "Failed to retrieve templates. Please try again"
            };
            try
            {
                // Try to get trending templates list
                var trendingTemplates = await _unitOfWork.WorcTemplateRepo
                  .GetAllAsync()
                  .OrderByDescending(o => o.UsagesCount)
                  .Include(i => i.CreatedByUser)
                  .ToListAsync();

                // Task successful
                serviceResponse.Data = trendingTemplates.Adapt<IEnumerable<WorcTemplateDto>>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Trending templates retrieved successfully";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                serviceResponse.Message = "An error occurred while fetching trending templates";
                return serviceResponse;
            }

            return serviceResponse;
        }

        // Retrieve Worc template category by search query
        public async Task<ServiceResponse<IEnumerable<WorcTemplateCategoryBySearchQueryDto>>> GetWorcTemplateCategoryBySearchQueryAsync(FlowTypesEnum type, string name)
        {
            // Initialize ServiceResponse with failed response
            var serviceResponse = new ServiceResponse<IEnumerable<WorcTemplateCategoryBySearchQueryDto>>
            {
                Data = null,
                Message = "Failed to get Worc template category by search query. Please try again"
            };

            try
            {
                // Fetch all templates and filter based on category and search query
                var templates = await _unitOfWork.WorcTemplateRepo.GetByConditionAsync(t => t.Type == type && t.Name == name)
                    .Select(t => new WorcTemplateCategoryBySearchQueryDto
                    {
                        Type = t.Type,
                        Name = t.Name
                    }).ToListAsync();

                // Check if there are any templates
                if (templates == null || !templates.Any())
                {
                    _logger.LogInformation("No Worc template categories found by search query.");
                    serviceResponse.Message = "No Worc templates found for the given search query";
                    serviceResponse.StatusCode = 404;
                    return serviceResponse;
                }

                // Task successful
                serviceResponse.Data = templates.Adapt<IEnumerable<WorcTemplateCategoryBySearchQueryDto>>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Successfully fetched Worc template category by search query.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                serviceResponse.Message = "An error occurred while fetching Worc template category by search query";
            }

            return serviceResponse;
        }

        // Searches flow template by name
        public async Task<ServiceResponse<IEnumerable<SearchWorcTemplateDto>>> SearchTemplatesAsync(string searchKey)
        {
            // Initialize ServiceResponse to indicate failure by default.
            var serviceResponse = new ServiceResponse<IEnumerable<SearchWorcTemplateDto>>
            {
                Data = null,
                Message = "Failed to search flow templates. Please try again."
            };

            try
            {
                // Attempt to retrieve the templates from the repository based on the search key.
                var flowTemplates = await _unitOfWork.WorcTemplateRepo
                               .GetByConditionAsync(w =>
                                   w.Name.ToLower().Contains(searchKey.ToLower())
                               )
                               .Include(c => c.CreatedByUser)
                               .ProjectToType<SearchWorcTemplateDto>()
                               .ToListAsync();

                // If successful, set the response data and status code.
                serviceResponse.Data = flowTemplates;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Flow templates retrieved successfully.";
            }
            catch (Exception ex)
            {
                // Log any exception and return the default failure message.
                _logger.LogError(ex.ToString());
            }

            // Return the service response with appropriate status and message.
            return serviceResponse;
        }

        // Get all trending templates
        public async Task<ServiceResponse<IEnumerable<TrendingTemplateDto>>> GetAllTrendingTemplatesAsync()
        {
            // Initialize a failed default response
            var serviceResponse = new ServiceResponse<IEnumerable<TrendingTemplateDto>>
            {
                Data = null,
                Message = "Failed to get trending templates. Please try again"
            };

            try
            {
                // Fetch AI model templates from external service
                // var aiModelTemplates = await GetAIModelTemplatesAsync();

                // Fetch Worc templates from the database, ordered by usage count
                var trendingTemplates = await _unitOfWork.WorcTemplateRepo
                    .GetAllAsync()
                    .Include(i => i.CreatedByUser)
                    .OrderByDescending(o => o.UsagesCount)
                    .ProjectToType<TrendingTemplateDto>()
                    .ToListAsync();

                // // Merge external AI model templates with local trending templates
                // if (aiModelTemplates.Any())
                // {
                //     trendingTemplates.AddRange(aiModelTemplates);
                // }

                // Return a successful response
                serviceResponse.Data = trendingTemplates.OrderByDescending(o => o.UsagesCount).ToList();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Trending templates retrieved successfully";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching trending templates");
                serviceResponse.Message = "An unexpected error occurred while fetching trending templates";
            }

            return serviceResponse;
        }

        // Publishes a flow version based on the specified type (Agent, Block, Template).
        public async Task<ServiceResponse<WorcTemplateDto>> PublishWorcTemplateAsync(PublishTemplateDto publishTemplateDto)
        {
            var serviceResponse = new ServiceResponse<WorcTemplateDto>
            {
                Data = null,
                Message = "Failed to publish the template. Please try again."
            };

            try
            {
                // Validate required fields based on access type
                if (publishTemplateDto.AccessType == AccessTypesEnum.Space && (publishTemplateDto.SpaceIds == null || !publishTemplateDto.SpaceIds.Any()))
                {
                    _logger.LogWarning("PublishTemplateAsync: 'AccessType' is set to 'Space' but no SpaceIds were provided.");
                    serviceResponse.Message = "When 'AccessType' is set to 'Space', at least one SpaceId must be specified.";
                    return serviceResponse;
                }

                // Fetch the flow version using RefId
                var flowVersion = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == publishTemplateDto.RefId)
                    .Include(fv => fv.Flow)
                    .SingleOrDefaultAsync();

                // Check if the flow version exists
                if (flowVersion == null)
                {
                    _logger.LogInformation("PublishTemplateAsync: No flow version found for RefId: {RefId}.", publishTemplateDto.RefId);
                    serviceResponse.Message = "Specified flow version does not exist.";
                    return serviceResponse;
                }

                // Map DTO to entity
                var templateEntity = publishTemplateDto.Adapt<WorcTemplate>();
                templateEntity.ReactFlowObject = flowVersion.ReactFlowObject;
                templateEntity.Type = flowVersion.Flow.Type;
                templateEntity.CreatedByUserId = _userId;
                templateEntity.LastModifiedByUserId = _userId;

                // Save template to repository
                await _unitOfWork.WorcTemplateRepo.InsertAsync(templateEntity);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("PublishTemplateAsync: Failed to persist WORC template to the database.");
                    return serviceResponse;
                }

                // Success
                serviceResponse.Data = templateEntity.Adapt<WorcTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Template published successfully.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PublishTemplateAsync: An unexpected error occurred.");
            }

            return serviceResponse;
        }

        // Uses a selected trending Worc template to create a new flow
        public async Task<ServiceResponse<TrendingTemplateDto>> UseTemplateToCreateFlowAsync(TrendingTemplateDto trendingTemplateDto)
        {
            // Initialize the response with a default failure message
            var serviceResponse = new ServiceResponse<TrendingTemplateDto>
            {
                Message = "Failed to add template. Please try again."
            };

            try
            {
                // Clean up the input DTO by trimming string properties to remove extra whitespace
                trendingTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(trendingTemplateDto);

                // Check if the template exists in the database using the template ID
                var templateEntity = await _unitOfWork.WorcTemplateRepo
                    .GetByConditionAsync(w => w.Id == trendingTemplateDto.Id)
                    .SingleOrDefaultAsync();

                // If template does not exist, log a warning and return with an appropriate message
                if (templateEntity == null)
                {
                    _logger.LogWarning("Template with ID: {TemplateId} not found in the database.", trendingTemplateDto.Id);
                    serviceResponse.Message = "Template not found in the database.";
                    return serviceResponse;
                }

                _logger.LogInformation("Template found in the database. Template ID: {TemplateId}", trendingTemplateDto.Id);

                // Retrieve the flow version entity linked to the template
                var flowVersionEntity = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == templateEntity.RefId)
                    .Include(i => i.Flow)
                    .SingleOrDefaultAsync();

                // Map the trending template DTO to a new Flow entity and set user info (created and last modified)
                var flowEntity = trendingTemplateDto.Adapt<Flow>();
                flowEntity.Name = $"{flowVersionEntity.Flow.Name} #{templateEntity.UsagesCount + 1}";
                flowEntity.Description = flowVersionEntity.Flow.Description;
                flowEntity.Type = flowVersionEntity.Flow.Type;
                flowEntity.CreatedByUserId = _userId;
                flowEntity.LastModifiedByUserId = _userId;

                // Insert the new Flow entity into the repository
                await _unitOfWork.FlowRepo.InsertAsync(flowEntity);

                // If saving fails, log the error and return a failure response
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save Flow entity for Template ID: {TemplateId}.", trendingTemplateDto.Id);
                    return serviceResponse;
                }

                _logger.LogInformation("Flow entity saved successfully for Template ID: {TemplateId}.", trendingTemplateDto.Id);

                // Map the DTO to a FlowVersion entity and set user information
                var newFlowVersionEntity = trendingTemplateDto.Adapt<FlowVersion>();
                newFlowVersionEntity.FlowId = flowEntity.Id;
                newFlowVersionEntity.ReactFlowObject = templateEntity.ReactFlowObject;
                newFlowVersionEntity.CreatedByUserId = _userId;
                newFlowVersionEntity.LastModifiedByUserId = _userId;

                // Insert the new FlowVersion entity into the repository
                await _unitOfWork.FlowVersionRepo.InsertAsync(newFlowVersionEntity);

                // If saving fails, log the error and return a failure response
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save FlowVersion entity for Template ID: {TemplateId}.", trendingTemplateDto.Id);
                    return serviceResponse;
                }

                _logger.LogInformation("FlowVersion entity saved successfully for Flow ID: {FlowId}.", flowEntity.Id);

                // Increment the usage count for the template by 1
                templateEntity.UsagesCount++;

                // Update the template entity in the repository
                _unitOfWork.WorcTemplateRepo.Update(templateEntity);

                // Try saving the updated template entity and log if the save operation fails
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save the updated template entity for Template ID: {TemplateId}.", trendingTemplateDto.Id);
                    return serviceResponse;
                }

                // Retrieve the saved FlowVersion entity with included navigation properties for detailed info
                flowVersionEntity = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == newFlowVersionEntity.Id)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.Flow)
                    .FirstOrDefaultAsync();

                // Log success and prepare the response with the saved FlowVersion data
                _logger.LogInformation("Template successfully added to the Template Library. Template ID: {TemplateId}.", trendingTemplateDto.Id);
                serviceResponse.Data = flowVersionEntity.Adapt<TrendingTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Template added successfully.";
            }
            catch (Exception ex)
            {
                // Catch any unhandled exceptions, log the details, and return a failure response
                _logger.LogError(ex, "An error occurred while saving the template to the Template Library. Template ID: {TemplateId}.", trendingTemplateDto.Id);
            }

            // Return the final service response
            return serviceResponse;
        }

        // Helper method to retrieve AI model templates from an external service
        private async Task<List<TrendingTemplateDto>> GetAIModelTemplatesAsync()
        {
            var client = _httpClientFactory.CreateClient();
            var requestUrl = $"{_httpClientUrlConfig.ModelStudioApisBaseUrl}/ai-model-template/trending";

            try
            {
                _logger.LogInformation("Sending request to: {Url}", requestUrl);

                // Try to retrieve the access token from the request cookies
                _httpContextAccessor.HttpContext.Request.Cookies.TryGetValue(CookieNamesEnum.AccessToken.ToString(), out var accessToken);

                if (string.IsNullOrEmpty(accessToken))
                {
                    _logger.LogWarning("Access token is missing from cookies.");
                    return new List<TrendingTemplateDto>();
                }

                // Set the Authorization header
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

                var response = await client.GetAsync(requestUrl);

                // Read response content once
                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Successful response received");
                }
                else
                {
                    _logger.LogError("Failed to retrieve templates. Status Code: {StatusCode}. Error Content: {ErrorContent}",
                        response.StatusCode, responseContent);
                    return new List<TrendingTemplateDto>();
                }

                var content = await response.Content.ReadAsStringAsync();

                _logger.LogInformation("Response received. Deserializing...");

                var apiResponse = System.Text.Json.JsonSerializer.Deserialize<ServiceResponse<IEnumerable<TrendingTemplateDto>>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiResponse?.Data == null)
                {
                    _logger.LogWarning("Deserialization resulted in null data.");
                    return new List<TrendingTemplateDto>();
                }

                return (List<TrendingTemplateDto>)apiResponse.Data;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving AI model templates.");
                return new List<TrendingTemplateDto>();
            }
        }
    }
}