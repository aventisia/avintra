# Use the official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY apis/WorcBackend-legacy/AccountsAPIs/AccountsAPIs.csproj ./
COPY apis/WorcBackend-legacy/AspNetToolkit/AspNetToolkit.csproj ../AspNetToolkit/
RUN dotnet restore AccountsAPIs.csproj

# Copy source code for both projects
COPY apis/WorcBackend-legacy/AccountsAPIs/. .
COPY apis/WorcBackend-legacy/AspNetToolkit ../AspNetToolkit

RUN dotnet publish AccountsAPIs.csproj -c Release -o /Publish --no-restore

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /Publish .

# IMPORTANT NOTE: the shared files folder is mounted over /var/www/aventisia.com/files, so the deploy step copies this seed into its scripts/ folder.
COPY clients/RunnerApp/RunnerApp.Windows/Install-AvintraRunnerService.ps1 /seed/scripts/Install-AvintraRunnerService.ps1

# Set port environment variable
ENV ASPNETCORE_URLS=http://+:4000

# Expose port
EXPOSE 4000

# Start the application
ENTRYPOINT ["dotnet", "AccountsAPIs.dll"]
