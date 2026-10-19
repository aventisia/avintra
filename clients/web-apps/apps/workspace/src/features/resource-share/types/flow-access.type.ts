import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";

export type AccessMode = "open" | "restricted";

export type FlowAccessAgent = {
  id: string;
  name: string;
  type?: FlowTypesEnum | null;
  versionCount?: number;
  lastModifiedOn?: string | null;
};

export type FlowAccessChange = "kept" | "added" | "removed";

export type FlowAccessRow = {
  agent: FlowAccessAgent;
  change: FlowAccessChange;
};
