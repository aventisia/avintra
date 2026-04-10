import {
  InputFieldProps,
  SelectFieldProps,
  TextareaFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

export enum RetrievalTypeEnum {
  Basic = "Basic",
  Advance = "Advance",
  Hybrid = "Hybrid",
}
// Query
export const queryProps: TextareaFieldProps = {
  name: "query",
  //   label: "Search Query",
  placeholder: "Type your query...",
  className: "min-h-[8rem]",
  isRequired: true,
};

// Number of chunks
export const numberOfChunksProps: InputFieldProps = {
  name: "numberOfChunks",
  label: "Number of Chunks",
  type: "number",
  isRequired: true,
};

// Retrieval Type
export const retrievalTypeProps: SelectFieldProps = {
  name: "retrievalType",
  label: "Retrieval Type",
  isRequired: true,
  selectOptions: enumToArray(RetrievalTypeEnum),
};
