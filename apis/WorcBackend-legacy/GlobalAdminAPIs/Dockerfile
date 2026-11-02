# Use the official .NET SDK image for build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY apis/WorcBackend-legacy/GlobalAdminAPIs/GlobalAdminAPIs.csproj ./
RUN dotnet restore GlobalAdminAPIs.csproj

# Copy source code
COPY apis/WorcBackend-legacy/GlobalAdminAPIs/. .
COPY apis/WorcBackend-legacy/AspNetToolkit/serilogsettings.json ../AspNetToolkit/

RUN dotnet publish GlobalAdminAPIs.csproj -c Release -o /Publish --no-restore

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /Publish .

# Set port environment variable
ENV ASPNETCORE_URLS=http://+:4004
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port
EXPOSE 4004

# Start the application
ENTRYPOINT ["dotnet", "GlobalAdminAPIs.dll"]
