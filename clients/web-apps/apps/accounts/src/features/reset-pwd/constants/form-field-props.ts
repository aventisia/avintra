import type {
  FloatingLabelInputFieldProps,
  InputFieldProps,
  InputOtpFieldProps,
} from "@avplatform/ui/form";

const className = "h-11 text-md";
const labelClassName = "text-md";

// Email
const emailProps: InputFieldProps = {
  autoFocus: true,
  name: "email",
  placeholder: "Enter your email",
  isRequired: true,
  type: "email",
  className: className,
};

// Verification code
const verificationCodeProps: InputOtpFieldProps = {
  autoFocus: true,
  name: "verificationCode",
  maxLength: 6,
  children: "", // Add an empty children property
  className: className,
};

// New password
const newPwdProps: FloatingLabelInputFieldProps = {
  autoFocus: true,
  label: "New password",
  name: "newPwd",
  type: "password",
  className: className,
  labelClassName: labelClassName,
};

// Confirm new password
const confirmNewPwdProps: FloatingLabelInputFieldProps = {
  label: "Confirm password",
  name: "confirmNewPwd",
  type: "password",
  className: className,
  labelClassName: labelClassName,
};

export { confirmNewPwdProps, emailProps, newPwdProps, verificationCodeProps };
