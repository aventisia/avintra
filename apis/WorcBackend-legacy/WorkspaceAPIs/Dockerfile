# Use the official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY apis/WorcBackend-legacy/WorkspaceAPIs/WorkspaceAPIs.csproj ./
COPY apis/WorcBackend-legacy/AspNetToolkit/AspNetToolkit.csproj ../AspNetToolkit/
RUN dotnet restore WorkspaceAPIs.csproj

# Copy source code for both projects
COPY apis/WorcBackend-legacy/WorkspaceAPIs/. .
COPY apis/WorcBackend-legacy/AspNetToolkit ../AspNetToolkit

RUN dotnet publish WorkspaceAPIs.csproj -c Release -o /Publish --no-restore

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /Publish .

# Copy default platform skills metadata so the seeder can read them at startup.
COPY apis/llmpipeline/app/features/langgraph/skills /app/skills

# Override default skills path to the location inside the runtime image.
ENV Skills__DefaultSkillsPath=skills

# Set port environment variable
ENV ASPNETCORE_URLS=http://+:4001
ENV ASPNETCORE_ENVIRONMENT=Development

# Expose port
EXPOSE 4001

# Start the application
ENTRYPOINT ["dotnet", "WorkspaceAPIs.dll"]
