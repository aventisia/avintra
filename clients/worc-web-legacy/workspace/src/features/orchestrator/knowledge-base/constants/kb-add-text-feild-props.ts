import { InputFieldProps, TextareaFieldProps } from "@aventisia/ui/form";

// Query
export const textContentProps: TextareaFieldProps = {
  name: "textContent",
  label: "Text Content",
  placeholder: "Enter or paste your text content here...",
  className: "min-h-[8rem]",
  isRequired: true,
};

// Chunk Size
export const chunkSizeProps: InputFieldProps = {
  name: "chunkSize",
  label: "Chunk Size",
  type: "number",
  isRequired: true,
};

// Chunk Overlap
export const chunkOverlapProps: InputFieldProps = {
  name: "chunkOverlap",
  label: "Chunk Overlap",
  type: "number",
  isRequired: true,
};
