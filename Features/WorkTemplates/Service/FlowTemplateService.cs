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

        // Publish flow as a Worc template
        public async Task<ServiceResponse<WorcTemplateDto>> PublishWorcTemplateAsync(Guid flowVersionId)
        {
            // Initialize ServiceResponse with failed response
            var serviceResponse = new ServiceResponse<WorcTemplateDto>
            {
                Data = null,
                Message = "Failed to publish flow as Worc template. Please try again"
            };
            try
            {
                var flowVersion = await _unitOfWork.FlowVersionRepo.GetByConditionAsync(w => w.Id == flowVersionId).FirstOrDefaultAsync();
                if (flowVersion == null)
                {
                    _logger.LogError($"Flow not found for Id:{flowVersionId}");
                    serviceResponse.Message = "Flow version does not exist";
                    return serviceResponse;
                }

                // Trim dto string properties
                var trimmedFlow = TrimDtoStringPropsUtil.TrimDtoStringProps(flowVersion);

                // Map the DTO to the entity
                var newWorcTemplate = trimmedFlow.Adapt<WorcTemplate>();
                newWorcTemplate.Type = CategoryTypesEnum.CategoryType1; // Modify category if necessary
                newWorcTemplate.CreatedByUserId = _userId;
                newWorcTemplate.LastModifiedByUserId = _userId;

                // Insert Worc template into the database
                await _unitOfWork.WorcTemplateRepo.InsertAsync(newWorcTemplate);

                // Insert-Job failed
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Context SaveChanges failed while publishing flow as a Worc template");
                    return serviceResponse;
                }

                // Task successful
                serviceResponse.Data = newWorcTemplate.Adapt<WorcTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Publish flow as Worc template successfully";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                serviceResponse.Message = "An error occurred while publishing flow as Worc template";
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
        public async Task<ServiceResponse<IEnumerable<WorcTemplateCategoryBySearchQueryDto>>> GetWorcTemplateCategoryBySearchQueryAsync(CategoryTypesEnum type, string name)
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
                var aiModelTemplates = await GetAIModelTemplatesAsync();

                // Fetch Worc templates from the database, ordered by usage count
                var trendingTemplates = await _unitOfWork.WorcTemplateRepo
                    .GetAllAsync()
                    .Include(i => i.CreatedByUser)
                    .OrderByDescending(o => o.UsagesCount)
                    .ProjectToType<TrendingTemplateDto>()
                    .ToListAsync();

                // Merge external AI model templates with local trending templates
                if (aiModelTemplates.Any())
                {
                    trendingTemplates.AddRange(aiModelTemplates);
                }

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
                _logger.LogDebug("Trimmed string properties for trending template DTO.");

                // Check if the template already exists in the database by looking for the template ID
                var templateEntity = await _unitOfWork.WorcTemplateRepo
                    .GetByConditionAsync(w => w.Id == trendingTemplateDto.Id)
                    .SingleOrDefaultAsync();

                // If template doesn't exist, log a warning and return with appropriate message
                if (templateEntity == null)
                {
                    _logger.LogWarning("Template not found in the database for ID: {TemplateId}", trendingTemplateDto.Id);
                    serviceResponse.Message = "Template not found in the database.";
                    return serviceResponse;
                }
                _logger.LogInformation("Template found in the database for ID: {TemplateId}", trendingTemplateDto.Id);

                // Map the DTO to a Flow entity and set the user information (created and last modified by)
                var flowEntity = trendingTemplateDto.Adapt<Flow>();
                flowEntity.CreatedByUserId = _userId;
                flowEntity.LastModifiedByUserId = _userId;

                // Insert the Flow entity into the repository
                _logger.LogInformation("Inserting Flow entity for Template ID: {TemplateId}", trendingTemplateDto.Id);
                await _unitOfWork.FlowRepo.InsertAsync(flowEntity);

                // If saving fails, log the failure and return the response
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save Flow entity for Template ID: {TemplateId}", trendingTemplateDto.Id);
                    return serviceResponse;
                }
                _logger.LogInformation("Flow entity saved successfully for Template ID: {TemplateId}", trendingTemplateDto.Id);

                // Map the DTO to a FlowVersion entity and set the user information again
                var flowVersionEntity = trendingTemplateDto.Adapt<FlowVersion>();
                flowVersionEntity.FlowId = flowEntity.Id;
                flowVersionEntity.ReactFlowObject = templateEntity.ReactFlowObject;
                flowVersionEntity.CreatedByUserId = _userId;
                flowVersionEntity.LastModifiedByUserId = _userId;

                // Insert the FlowVersion entity into the repository
                _logger.LogInformation("Inserting FlowVersion entity for Flow ID: {FlowId}", flowEntity.Id);
                await _unitOfWork.FlowVersionRepo.InsertAsync(flowVersionEntity);

                // If saving fails, log the failure and return the response
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save FlowVersion entity for Template ID: {TemplateId}", trendingTemplateDto.Id);
                    return serviceResponse;
                }
                _logger.LogInformation("FlowVersion entity saved successfully for Flow ID: {FlowId}", flowEntity.Id);

                // Increase the usage count for the template by 1.
                templateEntity.UsagesCount++;

                // Update the template entity in the repository.
                _unitOfWork.WorcTemplateRepo.Update(templateEntity);

                // Try saving the changes and log an error if the save operation fails.
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save the updated ML model entity for template ID: {TemplateId}.", trendingTemplateDto.Id);
                    return serviceResponse;
                }

                // Retrieve the saved FlowVersion entity with included navigation properties for detailed info
                flowVersionEntity = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == flowVersionEntity.Id)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.Flow)
                    .FirstOrDefaultAsync();

                // Log success and prepare the response with the saved FlowVersion data
                _logger.LogInformation("Template successfully saved to the Template Library. Template ID: {TemplateId}", trendingTemplateDto.Id);
                serviceResponse.Data = flowVersionEntity.Adapt<TrendingTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Template added successfully.";
            }
            catch (Exception ex)
            {
                // Catch any unhandled exceptions, log the details, and return a failed response
                _logger.LogError(ex, "An error occurred while saving template to Template Library. Template ID: {TemplateId}", trendingTemplateDto.Id);
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