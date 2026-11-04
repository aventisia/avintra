import { PublishTypesEnum } from "../enums/publish-types.enum";

export interface PublishFlowVersionDto {
  id: string;
  flowId: string;
  name?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  type: PublishTypesEnum;
}
