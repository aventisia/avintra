import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { InputOtpFieldProps } from "@/react-toolkit/ui/form/fields/InputOtpField";

const className = "h-11 text-md";

// Email
const emailProps: InputFieldProps = {
  name: "email",
  placeholder: "Enter your email",
  isRequired: true,
  type: "email",
  className: className,
};

// Verification code
const verificationCodeProps: InputOtpFieldProps = {
  name: "verificationCode",
  maxLength: 6,
  children: "", // Add an empty children property
  className: className,
};

// New password
const newPwdProps: InputFieldProps = {
  name: "newPwd",
  placeholder: "New password",
  type: "password",
  isRequired: true,
  className: className,
};

// Confirm new password
const confirmNewPwdProps: InputFieldProps = {
  name: "confirmNewPwd",
  placeholder: "Confirm password",
  type: "password",
  isRequired: true,
  className: className,
};

export { confirmNewPwdProps, emailProps, newPwdProps, verificationCodeProps };
