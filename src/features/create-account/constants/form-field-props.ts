import { InputFieldProps } from "@/react-toolkit/components/form";

// First Name
const firstNameProps: InputFieldProps = {
  name: "firstName",
  placeholder: "Firstname",
};

// Last Name
const lastNameProps: InputFieldProps = {
  name: "lastName",
  placeholder: "Lastname",
};

// Email
const emailProps: InputFieldProps = {
  name: "email",
  placeholder: "Email",
  isRequired: true,
  type: "email",
};

// Password
const pwdProps: InputFieldProps = {
  name: "pwd",
  placeholder: "Password",
  type: "password",
  isRequired: true,
};

// Confirm Password
const confirmPwdProps: InputFieldProps = {
  name: "confirmPwd",
  placeholder: "Confirm password",
  type: "password",
  isRequired: true,
};

// Verification code
const verificationCodeProps: InputFieldProps = {
  name: "verificationCode",
  placeholder: "Enter verification code",
};

export {
  firstNameProps,
  lastNameProps,
  emailProps,
  pwdProps,
  confirmPwdProps,
  verificationCodeProps,
};
