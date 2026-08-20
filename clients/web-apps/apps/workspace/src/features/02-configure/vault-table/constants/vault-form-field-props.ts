import { InputFieldProps, SwitchFieldProps, TextareaFieldProps } from "@avplatform/ui/form";

// Config Id
export const idProps: InputFieldProps = {
  name: "id",
  label: "Config Id",
  disabled: true,
};

// Name
export const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
  placeholder: "exampleName",
  description:
    "A **unique** name for the credential.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9), underscore (`_`), hyphen (`-`) and space.\n- **Can be changed** after creation.",
};

// User Name
export const userNameProps: InputFieldProps = {
  name: "username",
  label: "User Name",
  isRequired: true,
  placeholder: "exampleUserName",
};

// password
export const passwordProps: InputFieldProps = {
  name: "password",
  label: "Password",
  isRequired: true,
  type: "password",
};

//confirm password
export const confirmPasswordProps: InputFieldProps = {
  name: "confirmPassword",
  label: "Confirm Password",
  isRequired: true,
  type: "password",
};

// Description
export const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  className: "min-h-[6rem]",
};

// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Credentials",
  description: "Disable this Credentials if it's been outdated, or not in use anymore",
};
