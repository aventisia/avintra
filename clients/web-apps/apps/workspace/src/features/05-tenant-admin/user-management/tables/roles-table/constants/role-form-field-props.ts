import { CheckboxFieldProps, InputFieldProps, TextareaFieldProps } from "@avplatform/ui/form";

import { ACCESSES } from "./permissions-and-acesses";

// Project Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Role ID",
  disabled: true,
  className: "text-base",
};

export const roleNameProps: InputFieldProps = {
  name: "fullName",
  label: "Full name",
  isRequired: true,
  type: "text",
  maxLength: 256,
  className: "text-base",
  description:
    "A name for the role.\n\n- **Max length:** 256 characters.\n- **Can be changed** after creation.",
};

export const roleDescriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  isRequired: false,
  maxLength: 512,
  minLength: 0,
  className: "text-base resize-none",
  description: "A short description of the role (max 512 characters).",
};

export const permissionFieldProps: CheckboxFieldProps[] = ACCESSES.map((access) => ({
  name: access.toLowerCase().replace(/\s+/g, ""),
  label: access,
}));

export const rolePermissionsProps = [
  {
    role: "Client",
    permissions: permissionFieldProps,
  },
  {
    role: "Trade Partner",
    permissions: permissionFieldProps,
  },
  {
    role: "Trade",
    permissions: permissionFieldProps,
  },
  {
    role: "Admin",
    permissions: permissionFieldProps,
  },
];
