# Legacy .NET APIs

- **EF Core migrations**: set the environment so `.env.local` is loaded, and use the design-time factory plus `~/.dotnet/tools/dotnet-ef`:
  ```sh
  export ASPNETCORE_ENVIRONMENT=Localhost
  dotnet ef migrations add <Name> -o Data/Migrations --project apis/WorcBackend-legacy/AccountsAPIs --context=AccountsDbContext
  dotnet ef database update --project apis/WorcBackend-legacy/AccountsAPIs --context=AccountsDbContext
  ```
- **`AccountRole` table name**: the entity uses `[Table("Roles")]`, but the actual table is `AspNetRoles` (the attribute is inert; Identity owns the table name).
- **Warnings as errors**: `AccountsAPIs` and `AspNetToolkit` set `TreatWarningsAsErrors=true`. `WorkspaceAPIs` only suppresses nullable hints (`NoWarn` CS8602;NU1701). The local .NET 10 SDK sometimes skips CS1998 that the Jenkins .NET 8 SDK raises — scan async-without-await before trusting a local build.
- **AspNetToolkit rebuild cascade**: both APIs reference it, so any change to `AspNetToolkit` must be followed by rebuilding both APIs (Jenkins does this automatically).
- **ServiceResponse pattern**: controllers/services return `ServiceResponse<T>`. Controllers omit the `Async` suffix; service interfaces and implementations include it. Delete-multiple endpoints return the count of records deleted.
- Feature-folder conventions are in `AGENTS.md` in this directory.
