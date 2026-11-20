import { NodeDataType } from "@/types/node-data-type";

/**
 * A picker entry: canvas node data plus the catalog-owned subtitle and docs link.
 */
export type ActionEntryType = NodeDataType & {
  description: string;
  docsLink?: string;
};
