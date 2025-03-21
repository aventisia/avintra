import { InputFieldProps } from '@/react-toolkit/ui/form/fields/InputField';
import { SwitchFieldProps } from '@/react-toolkit/ui/form/fields/SwitchField';

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
};

// User Name
export const userNameProps: InputFieldProps = {
  name: "userName",
  label: "User Name",
  isRequired: true,
};

// password
export const passwordProps: InputFieldProps = {
  name: "password",
  label: "Password",
  isRequired: true,
  type: "password"
};


// Is Disabled
export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Credentials",
  description:
    "Disable this Credentials if it's been outdated, or not in use anymore",
};

