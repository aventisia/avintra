# WorkspaceAPIs

This directory contains the WorkspaceAPIs .NET service, including Dockerfile and configuration for containerized deployment.

## Files

- `WorkspaceAPIs.csproj`: Project file for the WorkspaceAPIs service
- `Dockerfile`: Multi-stage build for .NET 8.0
- `appsettings.json`, `appsettings.Development.json`: Application configuration
- `AspNetToolkit/`: Project dependency (ensure not excluded in Docker build)

## Usage

### 1. Build the Docker image (from project root):

```sh
# Build
sudo docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t hub.aventisia.com/avplatform/workspace-apis:0.1.0 .

# Test run locally (assumeing postgresql is running on localhost)
sudo docker run -d --name workspace-apis --network host -p 4001:4001 -e ASPNETCORE_ENVIRONMENT=Localhost hub.aventisia.com/avplatform/workspace-apis:0.1.0

# Check logs
sudo docker logs -f workspace-apis

# Stop and remove test container
sudo docker stop workspace-apis && sudo docker rm workspace-apis

# Push to private registry
sudo docker push hub.aventisia.com/avplatform/workspace-apis:0.1.0

```

### 2. Environment variables

- `ASPNETCORE_URLS` (default: `http://+:4001`)
- `ASPNETCORE_ENVIRONMENT` (default: `Development`)

Override these at runtime as needed:

```sh
sudo docker run -d --name workspace-apis -p 4001:4001 \
	-e ASPNETCORE_ENVIRONMENT=Production \
	avplatform/workspace-apis:latest
```

In local development (`ASPNETCORE_ENVIRONMENT` or `DOTNET_ENVIRONMENT` set to `Localhost`), `.env.local` in this directory is loaded before Kestrel binds (create it from `.env.example`; `scripts/setup.sh` does this), so its `ASPNETCORE_URLS` takes precedence over the launch profile URL. Use it to run parallel worktrees on separate ports, and start the service with this directory as the working directory (`cd apis/WorcBackend-legacy/WorkspaceAPIs && dotnet run`, or the `workspace_apis` VS Code task) so `.env.local` is found.

### 4. Development notes

- Ensure `AspNetToolkit/` is available and not excluded by `.dockerignore` if required for build.
- Update `appsettings.*.json` for environment-specific configuration.
- Exposed port: 4001 (see Dockerfile and environment variable)

### 5. Troubleshooting

- If build fails due to missing project references, check `.dockerignore` and Docker build context.
- For dependency changes, re-run `dotnet restore` and rebuild the image.

---

For more details, see the main project documentation or contact the platform maintainers.
