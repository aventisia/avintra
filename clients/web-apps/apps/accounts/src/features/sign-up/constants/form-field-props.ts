import type { FloatingLabelInputFieldProps, InputOtpFieldProps } from "@avplatform/ui/form";

const className = "h-control-lg";
const labelClassName = "text-md";

// First Name
const firstNameProps: FloatingLabelInputFieldProps = {
  autoFocus: true,
  label: "First name",
  name: "firstName",
  className: className,
  labelClassName: labelClassName,
};

// Last Name
const lastNameProps: FloatingLabelInputFieldProps = {
  label: "Last name",
  name: "lastName",
  className: className,
  labelClassName: labelClassName,
};

// Email
const emailProps: FloatingLabelInputFieldProps = {
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

export { emailProps, firstNameProps, lastNameProps, pwdProps, verificationCodeProps };
