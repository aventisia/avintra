import type { InputFieldProps, InputOtpFieldProps } from "@aventisia/ui/form";

const className = "h-11 text-md";

// Email
const emailProps: InputFieldProps = {
  autoFocus: true,
  name: "email",
  placeholder: "Email",
  isRequired: true,
  type: "email",
  className: className,
};

// Password
const pwdProps: InputFieldProps = {
  autoFocus: true,
  name: "pwd",
  placeholder: "Password",
  type: "password",
  isRequired: true,
  className: className,
};

// Verification code
const verificationCodeProps: InputOtpFieldProps = {
  autoFocus: true,
  name: "verificationCode",
  maxLength: 6,
  children: "", // Add an empty children property
};

export { emailProps, pwdProps, verificationCodeProps };
