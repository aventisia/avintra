/**
 * Builds deterministic OpenAPI specs per plugin (used to seed ws_Tools,
 * mirroring the Camel connector specs).
 */
import type { PluginMetadata } from "./types.js";
import { actionToLabel } from "./build-action-config.js";

/** Convert a Corsair `{ kind, optional, fields }` schema into an OpenAPI JSON Schema. */
export function corsairSchemaToOpenApiSchema(schema: any): any {
  if (!schema || typeof schema !== "object") {
    return { type: "object" };
  }
  const kind = schema.kind ?? "object";
  switch (kind) {
    case "object": {
      const properties: Record<string, any> = {};
      const required: string[] = [];
      for (const [name, field] of Object.entries<any>(schema.fields ?? {})) {
        properties[name] = corsairSchemaToOpenApiSchema(field);
        if (field?.optional === false) required.push(name);
      }
      const result: any = { type: "object", properties };
      if (required.length) result.required = required;
      return result;
    }
    case "array":
      return { type: "array", items: corsairSchemaToOpenApiSchema(schema.items) };
    case "number":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "string":
    default:
      return { type: "string" };
  }
}

/**
 * Build a per-plugin OpenAPI spec from a set of action descriptors.
 *
 * Corsair tools are platform tools executed via the sidecar, so the spec has
 * no provider base URL (no `servers` entry).
 *
 * @param plugin     normalized plugin metadata
 * @param actions    list of { action, description, input }
 */
export function buildOpenApiSpec(
  plugin: PluginMetadata,
  actions: Array<{ action: string; description: string; input: any }>,
): any {
  const paths: Record<string, any> = {};
  for (const { action, description, input } of actions) {
    const pathKey = `/corsair/${plugin.id}/${action}`;
    paths[pathKey] = {
      post: {
        operationId: `${plugin.id}.${action}`,
        summary: description || actionToLabel(action),
        description: description || actionToLabel(action),
        parameters: [],
        requestBody: {
          content: {
            "application/json": {
              schema: corsairSchemaToOpenApiSchema(input),
            },
          },
          required: false,
        },
      },
    };
  }

  return {
    openapi: "3.0.1",
    info: {
      title: `Corsair ${plugin.id} connector (from sidecar descriptors)`,
      version: "1.0.0",
    },
    paths,
  };
}
