import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { InputOtpFieldProps } from "@/react-toolkit/ui/form/fields/InputOtpField";

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
const verificationCodeProps: InputOtpFieldProps = {
  name: "verificationCode",
  maxLength: 6,
  children: "", // Add an empty children property
};

export { emailProps, pwdProps, verificationCodeProps };

