import { InputFieldProps, TextareaFieldProps } from "@avplatform/ui/form";

// Query
export const textContentProps: TextareaFieldProps = {
  name: "textContent",
  label: "Text content",
  placeholder: "Enter or paste your text content here...",
  className: "min-h-[8rem]",
  isRequired: true,
  rows: 12,
};

// Chunk Size
export const chunkSizeProps: InputFieldProps = {
  name: "chunkSize",
  label: "Chunk size",
  type: "number",
  isRequired: true,
};

// Chunk Overlap
export const chunkOverlapProps: InputFieldProps = {
  name: "chunkOverlap",
  label: "Chunk overlap",
  type: "number",
  isRequired: true,
};
