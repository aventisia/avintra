import type { FloatingLabelInputFieldProps, InputOtpFieldProps } from "@avplatform/ui/form";

const className = "h-11 text-md";
const labelClassName = "text-md";

// Email
const emailProps: FloatingLabelInputFieldProps = {
  autoFocus: true,
  label: "Email",
  name: "email",
  type: "email",
  className: className,
  labelClassName: labelClassName,
};

// Password
const pwdProps: FloatingLabelInputFieldProps = {
  label: "Password",
  name: "pwd",
  type: "password",
  className: className,
  labelClassName: labelClassName,
};

// Verification code
const verificationCodeProps: InputOtpFieldProps = {
  autoFocus: true,
  name: "verificationCode",
  maxLength: 6,
  children: "", // Add an empty children property
};

export { emailProps, pwdProps, verificationCodeProps };
