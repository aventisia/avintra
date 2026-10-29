# Backend engineering conventions

## Scope

- Governs `AccountsAPIs`, `WorkspaceAPIs`, and `AspNetToolkit` in this directory. Role scope and permissions come from the root `AGENTS.md`; these are code conventions only.
- Much existing code predates these rules (controller methods with `Async`, `Delete[Entities]` instead of `DeleteMultiple[Entities]`, delete-multiple returning `bool`). Apply the rules to code you create or touch, and leave untouched code alone.

## Project layout

- Features live in `Features/<FeatureName>/` (optionally nested under a domain such as `Features/Orchestrator/`). See `WorkspaceAPIs/Features/Orchestrator/MachinesTable/` for the reference shape:
  - `<Feature>Controller.cs` and `<Feature>MappingProfile.cs` at the feature root
  - `Service/` for the interface and implementation
  - `DTOs/`
  - `Helpers/` when the feature needs helper logic
- Entities live in the project-level `Entities/` folder, not in features. Name many-to-many join entities `Entity1_Entity2` (singular, PascalCase), and place them in `Entities/M2M/`.
- Before modifying a feature, read its `README.md` when one exists; it records domain boundaries, contracts, and exceptions. Add a README only when a feature has non-obvious boundaries or invariants.

## EE file marking

EE marking: see root `AGENTS.md` §EE file marking.

## Feature helpers

- Put helper methods in `public static` methods of a `public static class` named `<Feature>Helpers` (for example, `MachinesTableHelpers.cs`) inside the feature's `Helpers/` folder.
- Move a helper to `AspNetToolkit` only when multiple features or projects reuse it.

## Global usings

Each project has a `GlobalUsings.cs` that already imports the `AspNetToolkit.*` namespaces and the project's own `Entities`, `Data`, `Services`, `DTOs`, and similar. Check it before adding a `using`, and add one only for a namespace it does not cover.

## Controllers and services

- Keep method names and vertical order identical across the Controller, Service Interface, and Service Implementation.
- Controller methods omit the `Async` suffix; Service Interface and Implementation methods include it.
- Use these CRUD names, routes, and XML summaries:

  | Method | Route | Summary |
  |--------|-------|---------|
  | `Get[Entities]` | `[HttpGet("list")]` | `Retrieves list of [entities].` |
  | `Get[Entity]` | `[HttpGet("{[entity]Id}")]` | `Retrieves a [entity] by its ID.` |
  | `Insert[Entity]` | `[HttpPost]` | `Inserts a new [entity].` |
  | `Update[Entity]` | `[HttpPut]` | `Updates an existing [entity].` |
  | `Delete[Entity]` | `[HttpDelete("{[entity]Id}")]` | `Deletes an existing [entity].` |
  | `DeleteMultiple[Entities]` | `[HttpPost("delete-multiple")]` | `Deletes multiple [entities] by their IDs.` |

- `DeleteMultiple[Entities]` takes `[FromBody] IEnumerable<Guid>` and returns the number of records deleted (`ServiceResponse<int>`) in both the service and the controller.
- Name DTO parameters camelCase after their type: `CreateMachineDto createMachineDto`.

## Service responses

- `ServiceResponse<T>` (`AspNetToolkit/DTOs/ServiceResponse.cs`) serializes as `{ data, statusCode, message }`; the frontend reads it as `IHttpResponse<T>`.
- Start every service method with a failed response: `var serviceResponse = ServiceResponse<bool>.Create("Failed to [action]", 500);`
- Return through `Update`:
  - Failure: `serviceResponse.Update("Machine not found", 404);`
  - Success: `serviceResponse.Update("Machine added", 201, dataObject);` (or `null` message with `200`)
- Keep messages terse and action-specific: "Machine added", not "Machine added successfully to the database."
- Normalize a string before a database operation only when that field's contract permits it. Preserve case and whitespace in identifiers, tokens, passwords, and other exact values; treat email and search fields as case-sensitive unless their contract says otherwise.
- Split complex service logic into small, precisely named blocks.

## Entities and DTOs

- Match property order in DTOs and mapping profiles to the source entity.
- In mapping profiles, map only properties whose names differ between DTO and entity.
- Mark required properties with the C# `required` keyword alone; `[Required]` is redundant beside it.
- Put `[RequiredGuid]` (from `AspNetToolkit/Attributes`) on non-optional `Guid` DTO properties.
- Set `[StringLength]` from the entity's max length, and state that max length in the property's one-line XML summary.

## Logging and documentation

- Log with `_logger` only for critical production-debugging or compliance events.
- Follow the root `AGENTS.md` "Documentation and code style boundaries": one-sentence `/// <summary>` docs on public controller methods and service-interface contracts (kept in sync) and on public DTO properties; self-documenting names everywhere else. Document a service implementation method only when it is itself a public API or a diagnostic requires it.
- The only inline comment allowed is an `IMPORTANT NOTE:` for an external constraint, race condition, or required hack.

## Review checklist

Apply every item to each touched file:

1. Controller, interface, and implementation methods share names and vertical order.
2. `Async` suffix is absent on controllers and present on services.
3. CRUD names, routes, and summaries match the table.
4. DTO and mapping-profile property order matches the entity.
5. Non-optional `Guid`s use `[RequiredGuid]`; `[StringLength]` values and their XML summaries match the entity max length.
6. DTO parameters are camelCase.
7. Service methods start with a failed `ServiceResponse` and return through `Update`.
8. Delete-multiple endpoints return the deleted count.
9. String normalization follows each field's contract and preserves exact values.
10. Service logic is correct, complete, and consistent; defects outside your role's write scope become findings.
11. XML docs sit only on public boundaries; the only inline comments are `IMPORTANT NOTE:`s; logging is minimal.
12. No `using` duplicates a `GlobalUsings.cs` import.

## Artifact contents

The root handoff contract controls agent returns; these formats apply inside reports or explicitly requested standalone output.

- Code review: findings first, ordered by severity, each with file and line; then open questions or assumptions; then a minimal change summary.
- Code generation: complete, compilable code for every affected layer, with naming and ordering kept in sync across files.
