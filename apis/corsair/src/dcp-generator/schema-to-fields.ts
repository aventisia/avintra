/**
 * Converts a Corsair `{ kind, optional, fields }` schema (from
 * `getStructuredSchema`) into Studio DCP fields, deriving human-readable
 * labels and descriptions from the field key and Corsair-provided metadata.
 */
import type { DcpField } from "./types.js";

/** Map Corsair kind → DCP control type. */
export function kindToDcpType(kind: string): string {
  switch (kind) {
    case "string":
      return "text";
    case "number":
      return "number";
    case "boolean":
      return "checkbox";
    case "array":
      return "tag-input";
    case "object":
      return "json-editor";
    default:
      return "text";
  }
}

/**
 * Humanize a field key into a friendly label.
 *   "issueNumber"  → "Issue Number"
 *   "owner"        → "Owner"
 *   "per_page"     → "Per Page"
 */
export function humanizeFieldKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Convert a Corsair `{ kind, optional, fields }` schema into DCP fields.
 * Nested objects/arrays are flattened into a single JSON-editor/tag-input
 * field because the Studio DCP form does not support arbitrary nesting.
 */
export function corsairSchemaToDcpFields(
  schema: any,
  direction: "Input" | "Output",
  prefix = "",
): DcpField[] {
  if (!schema || typeof schema !== "object") return [];
  if (schema.kind !== "object") {
    // A non-object root (rare) becomes a single field.
    const name = prefix || "value";
    return [
      {
        direction,
        type: kindToDcpType(schema.kind ?? "string"),
        name,
        label: humanizeFieldKey(name),
        description: schema.description ?? "",
        defaultValue: "",
      },
    ];
  }

  const fields = schema.fields ?? {};
  const out: DcpField[] = [];

  for (const [name, fieldSchema] of Object.entries<any>(fields)) {
    const fieldName = prefix ? `${prefix}.${name}` : name;
    const kind = fieldSchema?.kind ?? "string";
    const label = humanizeFieldKey(name);
    const description = fieldSchema?.description ?? "";

    if (kind === "object") {
      // Flatten nested objects into a JSON-editor field.
      out.push({
        direction,
        type: "json-editor",
        name: fieldName,
        label,
        description,
        defaultValue: "{}",
      });
      continue;
    }

    if (kind === "array") {
      out.push({
        direction,
        type: "tag-input",
        name: fieldName,
        label,
        description,
        defaultValue: [],
      });
      continue;
    }

    const field: DcpField = {
      direction,
      type: kindToDcpType(kind),
      name: fieldName,
      label,
      description,
      defaultValue: kind === "boolean" ? false : kind === "number" ? 0 : "",
    };

    if (fieldSchema?.enum && Array.isArray(fieldSchema.enum)) {
      field.type = "select";
      field.selectOptions = fieldSchema.enum.map((v: any) => ({
        label: String(v),
        value: String(v),
        description: String(v),
      }));
      field.defaultValue = fieldSchema.enum[0] ?? "";
    }

    if (!fieldSchema?.optional) {
      field.required = true;
    }

    out.push(field);
  }

  return out;
}
