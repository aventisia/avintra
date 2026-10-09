import { InputFieldProps, SwitchFieldProps, TextareaFieldProps } from "@avplatform/ui/form";

export const idProps: InputFieldProps = {
  name: "id",
  label: "Config Id",
  disabled: true,
};

export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
  placeholder: "exampleName",
  description:
    "A **unique** name for the credential.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Cannot be changed** after creation.",
};

export const userNameProps: InputFieldProps = {
  name: "username",
  label: "User Name",
  isRequired: true,
  placeholder: "exampleUserName",
  description: "The username associated with the credential.",
};

export const passwordProps: InputFieldProps = {
  name: "password",
  label: "Password",
  isRequired: true,
  type: "password",
  description: "The password for the credential.",
};

export const confirmPasswordProps: InputFieldProps = {
  name: "confirmPassword",
  label: "Confirm Password",
  isRequired: true,
  type: "password",
  description: "Re-enter the password to confirm it matches.",
};

export const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  description: "A short summary of what the credential is used for.",
  className: "min-h-[6rem]",
};

export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Credentials",
  description: "Disable this Credentials if it's been outdated, or not in use anymore",
};
