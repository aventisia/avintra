import { FlowTypesEnum } from "@avplatform/ui/enums/flow-types-enum";
import { ISelectOption } from "@avplatform/ui/types";

/**
 * A flow search result.
 */
export interface FlowSearchOptionDto extends ISelectOption {
  type: FlowTypesEnum;
  versionCount: number;
  lastModifiedOn: string | null;
}
