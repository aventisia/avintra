namespace WorkspaceAPIs.Controllers;

[Route("project")]
[ApiController]
[Authorize]
public class ProjectsTableController : BaseApiController
{
    private readonly IProjectsTableService _projectsTableService;

    public ProjectsTableController(IProjectsTableService projectsTableService)
    {
        _projectsTableService = projectsTableService;
    }

    // Retrieves list of projects.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ProjectsTableDto>>>> GetProjects()
    {
        return ResultHelper(await _projectsTableService.GetProjectsAsync());
    }

    // Inserts a new project.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ProjectsTableDto>>> InsertProject([FromBody] ProjectsTableDto projectsTableDto)
    {
        return ResultHelper(await _projectsTableService.InsertProjectAsync(projectsTableDto));
    }

    // Updates an existing project.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ProjectsTableDto>>> UpdateProject([FromBody] ProjectsTableDto projectsTableDto)
    {
        return ResultHelper(await _projectsTableService.UpdateProjectAsync(projectsTableDto));
    }

    // Deletes a project by its ID.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteProject(Guid id)
    {
        return ResultHelper(await _projectsTableService.DeleteProjectAsync(id));
    }
}