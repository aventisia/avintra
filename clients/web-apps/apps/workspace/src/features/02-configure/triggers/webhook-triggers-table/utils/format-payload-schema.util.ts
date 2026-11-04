/**
 * Pretty-prints a JSON payload schema as the JSON editor does, or returns it unchanged if invalid.
 */
export const formatPayloadSchema = (schema: string) => {
  try {
    return JSON.stringify(JSON.parse(schema), null, 2);
  } catch {
    return schema;
  }
};
