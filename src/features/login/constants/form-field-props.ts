import { InputFieldProps } from "@/react-toolkit/components/form";

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

// Verification code
const verificationCodeProps: InputFieldProps = {
  name: "verificationCode",
  placeholder: "Enter 2FA code",
};

export { emailProps, pwdProps, verificationCodeProps };
