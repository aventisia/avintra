/**
 * Builds deterministic OpenAPI specs per plugin (used to seed ws_Tools,
 * mirroring the Camel connector specs).
 *
 * Field labels/descriptions come from the same per-plugin node field mapping
 * used by the Cloud Connector config generator, so Corsair-generated tools show
 * the same user-friendly text (as JSON Schema `title` + `description`).
 *
 * IMPORTANT NOTE: `title`/`description` are emitted for every field, with
 * precedence authored mapping > Corsair schema `title`/`description`. This
 * intentionally surfaces schema descriptions for all plugins (previously the
 * OpenAPI specs carried neither), matching what the DCP configs already used.
 */
import type { PluginMetadata } from "./types.js";
import type { FieldMetadata } from "./node-field-mappings/types.js";
import {
  resolveFieldMetadata,
  resolveNodeDescription,
  resolveNodeFieldMapping,
} from "./node-field-mappings/resolve.js";
import { actionToLabel, actionToNodeName } from "./build-action-config.js";

/** Convert a Corsair `{ kind, optional, fields }` schema into an OpenAPI JSON Schema. */
export function corsairSchemaToOpenApiSchema(
  schema: any,
  fieldMetadata?: Record<string, FieldMetadata>,
  prefix = "",
): any {
  if (!schema || typeof schema !== "object") {
    return { type: "object" };
  }
  const kind = schema.kind ?? "object";
  switch (kind) {
    case "object": {
      const properties: Record<string, any> = {};
      const required: string[] = [];
      for (const [name, field] of Object.entries<any>(schema.fields ?? {})) {
        const fullName = prefix ? `${prefix}.${name}` : name;
        const child = corsairSchemaToOpenApiSchema(field, fieldMetadata, fullName);
        // Precedence: authored mapping > Corsair schema description/title.
        const meta = resolveFieldMetadata(fieldMetadata, name, fullName);
        const title = meta?.label ?? field?.title;
        const description = meta?.description ?? field?.description;
        properties[name] = {
          ...child,
          ...(title ? { title } : {}),
          ...(description ? { description } : {}),
        };
        if (field?.optional === false) required.push(name);
      }
      const result: any = { type: "object", properties };
      if (required.length) result.required = required;
      return result;
    }
    case "array":
      return { type: "array", items: corsairSchemaToOpenApiSchema(schema.items, fieldMetadata, prefix) };
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
 * @param plugin     normalized plugin metadata (may carry a node field mapping)
 * @param actions    list of { action, description, input }
 */
export function buildOpenApiSpec(
  plugin: PluginMetadata,
  actions: Array<{ action: string; description: string; input: any }>,
): any {
  const paths: Record<string, any> = {};
  for (const { action, description, input } of actions) {
    const nodeName = actionToNodeName(plugin.id, action);
    const { nodeOverride, fieldMetadata } = resolveNodeFieldMapping(
      plugin.nodeFieldMapping,
      nodeName,
    );
    const operationDescription = resolveNodeDescription(
      nodeOverride,
      description,
      actionToLabel(action),
    );

    const pathKey = `/corsair/${plugin.id}/${action}`;
    paths[pathKey] = {
      post: {
        operationId: `${plugin.id}.${action}`,
        summary: operationDescription,
        description: operationDescription,
        parameters: [],
        requestBody: {
          content: {
            "application/json": {
              schema: corsairSchemaToOpenApiSchema(input, fieldMetadata),
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
