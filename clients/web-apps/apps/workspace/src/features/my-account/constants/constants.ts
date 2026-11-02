import type { InputFieldProps, InputOtpFieldProps } from "@avplatform/ui/form";

export const UN_QUERY_KEY_UPDATE_EMAIL = ["update-email"];
export const UN_QUERY_KEY_UPDATE_PASSWORD = ["update-pwd"];
export const UN_QUERY_KEY_UPDATE_PROFILE = ["update-profile"];
export const UN_QUERY_KEY_GET_PROFILE = ["get-profile"];

export const UN_QUERY_KEY_UPDATE_TENANT_PROFILE = ["update-tenant-profile"];
export const UN_QUERY_KEY_GET_TENANT_PROFILE = ["get-tenant-profile"];

// Verification code
export const verificationCodeProps: InputOtpFieldProps = {
  name: "verificationCode",
  maxLength: 6,
  children: "", // Add an empty children property
};

const className = "h-11 text-sm";

// Email
export const emailProps: InputFieldProps = {
  name: "email",
  placeholder: "Email",
  isRequired: true,
  type: "email",
  className: className,
};
