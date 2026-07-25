# AspNetToolkit

Shared .NET utility library for the Aventisia legacy backend services.

## Overview

`AspNetToolkit` contains reusable code used by both `AccountsAPIs` and `WorkspaceAPIs` in the `apis/WorcBackend-legacy` directory. It provides common controllers, middleware, extension methods, DTOs, entities, attributes, configuration helpers, and other cross-cutting concerns.

## Key Components

- **Attributes** — Custom action filters and authorization/validation attributes
- **Config** — Configuration models and helpers
- **Controllers** — Base/shared controller implementations
- **DTOs** — Reusable data-transfer objects
- **Entities** — Common entity definitions
- **Enums** — Shared enumerations
- **Extensions** — Extension methods for ASP.NET Core, EF Core, etc.
- **Middleware** — Custom middleware components
- **Repos** — Base repository patterns and helpers
- **Services** — Shared service abstractions
- **Utils** — General utility classes

## Usage

`AccountsAPIs` and `WorkspaceAPIs` reference this project directly. When building Docker images, make sure `AspNetToolkit` is not excluded by `.dockerignore` and is copied into the build context alongside the service project.

## Notes

- This is a supporting library for the legacy .NET backend.
- For the new backend stack, see `apis/WorcBackend/`.
