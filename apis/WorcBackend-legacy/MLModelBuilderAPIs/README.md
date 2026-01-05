# MLModelBuilderAPIs

This directory contains the MLModelBuilderAPIs .NET service, including Dockerfile and configuration for containerized deployment.

## Files

- `MLModelBuilderAPIs.csproj`: Project file for the MLModelBuilderAPIs service
- `Dockerfile`: Multi-stage build for .NET 8.0
- `appsettings.json`, `appsettings.Development.json`: Application configuration
- `AspNetToolkit/`: Project dependency (ensure not excluded in Docker build)

## Usage

### 1. Build the Docker image (from project root):

```sh
# Build
sudo docker build -f apis/WorcBackend-legacy/MLModelBuilderAPIs/Dockerfile -t hub.aventisia.com/worc/aistudio-apis:0.1.0 .

# Test run locally (assumeing postgresql is running on localhost)
sudo docker run -d --name worc-aistudio-apis --network host -p 4002:4002 -e ASPNETCORE_ENVIRONMENT=Localhost hub.aventisia.com/worc/aistudio-apis:0.1.0

# Check logs
sudo docker logs -f worc-aistudio-apis

# Stop and remove test container
sudo docker stop worc-aistudio-apis && sudo docker rm worc-aistudio-apis

# Push to private registry
sudo docker push hub.aventisia.com/worc/aistudio-apis:0.1.0
```

### 2. Environment variables

- `ASPNETCORE_URLS` (default: `http://+:4002`)
- `ASPNETCORE_ENVIRONMENT` (default: `Development`)

Override these at runtime as needed:

```sh
sudo docker run -d --name worc-aistudio-apis -p 4002:4002 \
	-e ASPNETCORE_ENVIRONMENT=Production \
	hub.aventisia.com/worc/aistudio-apis:latest
```

### 4. Development notes

- Ensure `AspNetToolkit/` is available and not excluded by `.dockerignore` if required for build.
- Update `appsettings.*.json` for environment-specific configuration.
- Exposed port: 4001 (see Dockerfile and environment variable)

### 5. Troubleshooting

- If build fails due to missing project references, check `.dockerignore` and Docker build context.
- For dependency changes, re-run `dotnet restore` and rebuild the image.

---

For more details, see the main project documentation or contact the platform maintainers.
