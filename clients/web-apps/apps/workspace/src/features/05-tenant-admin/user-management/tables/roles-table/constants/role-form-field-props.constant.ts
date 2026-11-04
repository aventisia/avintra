import { InputFieldProps, TextareaFieldProps } from "@avplatform/ui/form";

export const roleNameProps: InputFieldProps = {
  name: "fullName",
  label: "Name",
  isRequired: true,
  type: "text",
  maxLength: 256,
  placeholder: "e.g. Support agent",
  description:
    "A name for the role.\n\n- **Max length:** 256 characters.\n- **Can be changed** after creation.",
};

export const roleDescriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  maxLength: 500,
  placeholder: "Who is this role for?",
  className: "resize-none",
  description: "A short description of the role (max 500 characters).",
};

export const rolePermissionsProps = {
  label: "Permissions",
  isRequired: true,
  description:
    "Pick the access this role gets per feature. **Full** turns on every access for that feature.",
};
