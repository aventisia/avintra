namespace WorkspaceAPIs.Services;

public class ProjectsTableService : IProjectsTableService
{
    private readonly ILogger<ProjectsTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ProjectsTableService(
        ILogger<ProjectsTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves list of projects.
    public async Task<ServiceResponse<IEnumerable<ProjectsTableDto>>> GetProjectsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<ProjectsTableDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get projects
            var projects = await _unitOfWork.ProjectRepo
                                        .GetByConditionAsync(w => true) //PEDNING: Update condition
                                        .OrderByDescending(o => o.CreatedOn)
                                        .ProjectToType<ProjectsTableDto>()
                                        .ToListAsync();

            // Task successful
            serviceResponse.Data = projects.Adapt<IEnumerable<ProjectsTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Projects retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Inserts a new project.
    public async Task<ServiceResponse<ProjectsTableDto>> InsertProjectAsync(ProjectsTableDto projectsTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ProjectsTableDto>
        {
            Data = null,
            Message = "Failed to insert project. Please try again"
        };

        try
        {
            // Validate project uniqueness
            var projectAlreadyExists = await _unitOfWork.ProjectRepo
                                        .GetByConditionAsync(w => w.Name.ToLower() == projectsTableDto.Name.ToLower())
                                        .FirstOrDefaultAsync();

            // Project already exists
            if (projectAlreadyExists != null)
            {
                _logger.LogInformation($"Project already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A project with same Name already exists. Please enter a unique Name";
                return serviceResponse;
            }

            // Trim dto' string props
            projectsTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(projectsTableDto);

            // Default mapping
            var newProject = projectsTableDto.Adapt<Project>();
            newProject.CreatedByUserId = _userId;
            newProject.LastModifiedByUserId = _userId;

            // Insert project 
            await _unitOfWork.ProjectRepo.InsertAsync(newProject);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new Project");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newProject.Adapt<ProjectsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Project created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing project.
    public async Task<ServiceResponse<ProjectsTableDto>> UpdateProjectAsync(ProjectsTableDto projectsTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ProjectsTableDto>
        {
            Data = null,
            Message = "Failed to update project. Please try again"
        };

        try
        {
            // Validate project existence
            var project = await _unitOfWork.ProjectRepo
                                        .GetByConditionAsync(w => w.Id == projectsTableDto.Id)
                                        .SingleOrDefaultAsync();

            // Project does not exist
            if (project == null)
            {
                _logger.LogInformation($"Project does not exist");
                serviceResponse.Message = "Project does not exist";
                return serviceResponse;
            }

            // Validate project uniqueness
            var projectAlreadyExists = await _unitOfWork.ProjectRepo
                                        .GetByConditionAsync(w =>
                                            w.Name.ToLower() == projectsTableDto.Name.ToLower() &&
                                            w.Id != projectsTableDto.Id)
                                        .FirstOrDefaultAsync();

            // Project already exists
            if (projectAlreadyExists != null)
            {
                _logger.LogInformation($"Project already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A project with same Name already exists. Please enter a unique Name";
                return serviceResponse;
            }

            // Trim dto' string props
            projectsTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(projectsTableDto);

            // Default mapping 
            projectsTableDto.Adapt(project);
            project.LastModifiedByUserId = _userId;
            project.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update project
            _unitOfWork.ProjectRepo.Update(project);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating Project");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = project.Adapt<ProjectsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Project updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a project by its ID.
    public async Task<ServiceResponse<bool>> DeleteProjectAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete project. Please try again"
        };

        try
        {
            // Validate project existence
            var project = await _unitOfWork.ProjectRepo
                                        .GetByConditionAsync(w => w.Id == id)
                                        .SingleOrDefaultAsync();

            // Project does not exist
            if (project == null)
            {
                _logger.LogInformation($"Project does not exist");
                serviceResponse.Message = "Project does not exist";
                return serviceResponse;
            }

            //#PENDING: UPDATE THIS CHECK ONCE ENTITY IS FORMED

            // Flows are linked with project
            // if (await _unitOfWork.FlowRepo.GetByConditionAsync(w => w.ProjectId == id).CountAsync() > 0)
            // {
            //     _logger.LogInformation($"Cannot delete project because it is linked with flow records");
            //     serviceResponse.Message = "Cannot delete requested project because it is linked with flow records";
            //     return serviceResponse;
            // }

            // Delete project
            _unitOfWork.ProjectRepo.Delete(project);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting project");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Project deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

}