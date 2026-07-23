import { InputFieldProps, TextareaFieldProps } from "@avplatform/ui/form";

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
