import { CheckboxFieldProps } from "@/react-toolkit/ui/form/fields/CheckboxField";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { TextareaFieldProps } from "@/react-toolkit/ui/form/fields/TextareaField";

import { ACCESSES } from "./permissions-and-acesses";

// Project Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Role Id",
  disabled: true,
  className: "text-base",
};

export const roleNameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
  type: "text",
  maxLength: 256,
  className: "text-base",
};

export const roleDescriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  isRequired: false,
  maxLength: 512,
  minLength: 0,
  className: "text-base resize-none",
};

export const permissionFieldProps: CheckboxFieldProps[] = ACCESSES.map(
  (access) => ({
    name: access.toLowerCase().replace(/\s+/g, ""),
    label: access,
  }),
);

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
