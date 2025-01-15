import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";
import { InputOtpFieldProps } from "@/react-toolkit/ui/form/fields/InputOtpField";

const className = "h-11 text-md";

// First Name
const firstNameProps: InputFieldProps = {
  name: "firstName",
  placeholder: "Firstname",
  className: className,
};

// Last Name
const lastNameProps: InputFieldProps = {
  name: "lastName",
  placeholder: "Lastname",
  className: className,
};

// Email
const emailProps: InputFieldProps = {
  name: "email",
  placeholder: "Email",
  isRequired: true,
  type: "email",
  className: className,
};

// Password
const pwdProps: InputFieldProps = {
  name: "pwd",
  placeholder: "Password",
  type: "password",
  isRequired: true,
  className: className,
};

// Confirm Password
const confirmPwdProps: InputFieldProps = {
  name: "confirmPwd",
  placeholder: "Confirm password",
  type: "password",
  isRequired: true,
  className: className,
};

// Verification code
const verificationCodeProps: InputOtpFieldProps = {
  name: "verificationCode",
  maxLength: 6,
  children: "", // Add an empty children property
};

export {
  confirmPwdProps,
  emailProps,
  firstNameProps,
  lastNameProps,
  pwdProps,
  verificationCodeProps,
};
