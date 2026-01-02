# WorcAPIs

This directory contains the WorcAPIs .NET service, including Dockerfile and configuration for containerized deployment.

## Files

- `WorkspaceAPIs.csproj`: Project file for the WorcAPIs service
- `Dockerfile`: Multi-stage build for .NET 8.0
- `appsettings.json`, `appsettings.Development.json`: Application configuration
- `AspNetToolkit/`: Project dependency (ensure not excluded in Docker build)

## Usage

### 1. Build the Docker image (from project root):

```sh
# Build
sudo docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t worc/worc-apis:latest .

# Test run locally (assumeing postgresql is running on localhost)
sudo docker run -d --name worc-apis-test --network host -p 4001:4001 -e ASPNETCORE_ENVIRONMENT=Localhost worc/worc-apis:latest

# Check logs
sudo docker logs -f worc-apis-test

# Stop and remove test container
sudo docker stop worc-apis-test && sudo docker rm worc-apis-test

# Push to private registry (optional)
sudo docker tag worc/worc-apis:latest hub.aventisia.com/worc/worc-apis:latest
sudo docker push hub.aventisia.com/worc/worc-apis:latest

# Login to private registry (if needed)
sudo docker login hub.aventisia.com
```

### 2. Environment variables

- `ASPNETCORE_URLS` (default: `http://+:4001`)
- `ASPNETCORE_ENVIRONMENT` (default: `Development`)

Override these at runtime as needed:

```sh
sudo docker run -d --name worc-apis -p 4001:4001 \
	-e ASPNETCORE_ENVIRONMENT=Production \
	worc/worc-apis:latest
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
