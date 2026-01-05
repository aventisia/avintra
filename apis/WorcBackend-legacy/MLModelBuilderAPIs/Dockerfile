# Use the official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY apis/WorcBackend-legacy/MLModelBuilderAPIs/MLModelBuilderAPIs.csproj ./
COPY apis/WorcBackend-legacy/AspNetToolkit/AspNetToolkit.csproj ../AspNetToolkit/
RUN dotnet restore MLModelBuilderAPIs.csproj

# Copy source code for both projects
COPY apis/WorcBackend-legacy/MLModelBuilderAPIs/. .
COPY apis/WorcBackend-legacy/AspNetToolkit ../AspNetToolkit

RUN dotnet publish MLModelBuilderAPIs.csproj -c Release -o /Publish --no-restore

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /Publish .

# Set port environment variable
ENV ASPNETCORE_URLS=http://+:4002
ENV ASPNETCORE_ENVIRONMENT=Development

# Expose port
EXPOSE 4002

# Start the application
ENTRYPOINT ["dotnet", "MLModelBuilderAPIs.dll"]