import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";

// Email
const emailProps: InputFieldProps = {
  name: "email",
  placeholder: "Enter your email",
  isRequired: true,
  type: "email",
};

// Verification code
const verificationCodeProps: InputFieldProps = {
  name: "verificationCode",
  placeholder: "Enter verification code",
};

// New password
const newPwdProps: InputFieldProps = {
  name: "pwd",
  placeholder: "New password",
  type: "password",
  isRequired: true,
};

// Confirm new password
const confirmNewPwdProps: InputFieldProps = {
  name: "confirmNewPwd",
  placeholder: "Confirm password",
  type: "password",
  isRequired: true,
};

export { confirmNewPwdProps, emailProps, newPwdProps, verificationCodeProps };
