import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import type { Edge, Node } from "@xyflow/react";

/** A flow's canvas as read from an exported file, keeping every writer-added key. */
export type FlowImportCanvas = Record<string, unknown> & {
  nodes: Node[];
  edges: Edge[];
  viewport: unknown;
};

/** A flow variables entry as exported: the owning node and its enabled outputs. */
export type FlowImportVariable = {
  nodeId: string;
  outputs: string[];
};

/** Validated content of an exported agent file, ready for direct creation. */
export type FlowImportPayload = {
  name: string;
  type: FlowTypesEnum;
  description: string;
  canvas: FlowImportCanvas;
  flowVariablesObject: FlowImportVariable[];
  inputOutputObject?: unknown[];
  supportedPlatform?: string;
};
