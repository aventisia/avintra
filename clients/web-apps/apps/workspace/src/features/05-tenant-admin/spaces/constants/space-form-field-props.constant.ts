import { InputFieldProps, TextareaFieldProps } from "@avplatform/ui/form";

const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
  maxLength: 20,
  placeholder: "e.g. Finance",
  description:
    "A **unique** name for the space.\n\n- **Max length:** 20 characters.\n- **Can be changed** after creation.",
};

const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  maxLength: 500,
  placeholder: "Who works in this space?",
  description: "A short description of the space (max 500 characters).",
};

export { nameProps, descriptionProps };
