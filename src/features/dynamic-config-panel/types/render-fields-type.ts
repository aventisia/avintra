import { DCPFieldSchemaType } from "./dcp-field-schema-type";

export type RenderItem =
  | DCPFieldSchemaType
  | {
      groupName: string;
      fields: DCPFieldSchemaType[];
    };
