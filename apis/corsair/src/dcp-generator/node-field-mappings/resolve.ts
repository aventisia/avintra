/**
 * Shared resolution helpers for the hand/AI-authored node field mappings.
 *
 * Centralized so every consumer (per-action configs, action selector, tool
 * OpenAPI specs) resolves field metadata and node overrides identically.
 */
import type { FieldMetadata, NodeOverride, PluginNodeFieldMapping } from "./types.js";

/**
 * Resolve friendly metadata for a field, preferring the leaf name so shared
 * definitions apply regardless of nesting, then the full dotted name.
 *
 * IMPORTANT NOTE: leaf-first means a shared leaf name (e.g. "color") applies to
 * every node and nesting that uses that leaf. This is intentional for shared
 * fields; override at the node level (or with a dotted key) when a leaf is
 * ambiguous between contexts.
 */
export function resolveFieldMetadata(
  fieldMetadata: Record<string, FieldMetadata> | undefined,
  leafName: string,
  fullName: string,
): FieldMetadata | undefined {
  return fieldMetadata?.[leafName] ?? fieldMetadata?.[fullName];
}

/**
 * Resolve a node's overrides and the merged field metadata for that node.
 *
 * IMPORTANT NOTE: plugin-level fields are the single shared source; node-level
 * fields win on conflict.
 */
export function resolveNodeFieldMapping(
  mapping: PluginNodeFieldMapping | undefined,
  nodeName: string,
): { nodeOverride: NodeOverride | undefined; fieldMetadata: Record<string, FieldMetadata> } {
  const nodeOverride = mapping?.nodeOverrides?.[nodeName];
  const fieldMetadata = {
    ...(mapping?.fields ?? {}),
    ...(nodeOverride?.fields ?? {}),
  };
  return { nodeOverride, fieldMetadata };
}

/**
 * Resolve a node's command description with the single shared precedence:
 * authored node override > Corsair/endpoint description > humanized action label.
 *
 * Centralized so the config, action-selector and OpenAPI builders cannot drift.
 */
export function resolveNodeDescription(
  nodeOverride: NodeOverride | undefined,
  description: string,
  actionLabel: string,
): string {
  return nodeOverride?.description ?? (description || actionLabel);
}
