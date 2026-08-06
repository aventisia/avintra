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

# Create directory for binaries
RUN mkdir -p /var/www/aventisia.com/files/binaries

# Create directory for install scripts
RUN mkdir -p /var/www/aventisia.com/files/scripts

# Copy NSIS bundle files to binaries directory
COPY clients/desktop-app/src-tauri/target/release/bundle/nsis/ /var/www/aventisia.com/files/binaries/

# Copy the runner install script to the scripts directory
COPY clients/DesktopExecutor/Install-AvintraDesktopRunner.ps1 /var/www/aventisia.com/files/scripts/Install-AvintraDesktopRunner.ps1

# Set port environment variable
ENV ASPNETCORE_URLS=http://+:4000
ENV ASPNETCORE_ENVIRONMENT=Development

# Expose port
EXPOSE 4000

# Start the application
ENTRYPOINT ["dotnet", "AccountsAPIs.dll"]
