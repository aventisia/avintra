/** Output: ${label} may only contain letters, numbers, hyphens, and underscores. */
const usernameError = (label: string) =>
  `${label} may only contain letters, numbers, hyphens, and underscores.`;

/** Output: Invalid IP address. Must be a valid IPv4 or IPv6 address. */
const ipAddressError = () => `Invalid IP address. Must be a valid IPv4 or IPv6 address.`;

/** Output: Invalid email address */
const emailError = () => `Invalid email address`;

/** Output: ${label} can only contain digits (0-9), hyphen (-), space ( ), dot (.), hash (#), star (*) and plus (+) only */
const phoneError = (label: string) =>
  `${label} can only contain digits (0-9), hyphen (-), space ( ), dot (.), hash (#), star (*) and plus (+)`;

/** Output: ${label} can only contain letters and a single space between words */
const nameError = (label: string) =>
  `${label} can only contain letters and a single space between words`;

/**
 * Output: ${label} can only contain letters, numbers, spaces, hyphens (-), and underscores (_)
 */
const flexibleNameError = (label: string) =>
  `${label} can only contain letters, numbers, spaces, hyphens (-), and underscores (_)`;

/** Output: ${label} can only contain digits */
const numericError = (label: string) => `${label} can only contain digits`;

/** Output: ${label} can only contain letters, number and a single space between words */
const alphaNumericError = (label: string) =>
  `${label} can only contain letters, number and a single space between words`;

/** Output: ${label} can only contain letters, number and underscore */
const variableError = (label: string) => `${label} can only contain letters, number and underscore`;

/** Checks whether field contains no-whitespaces or not */
const noWhitespaceError = (label: string) => `${label} does not allow whitespace`;

/** Output: ${label} can only contain minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character */
const pwdError = (label: string) =>
  `${label} can only contain minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character`;

//-----------------------------------------------------------------

/** Output: ${label} is required */
const reqError = (label: string) => `${label} is required`;

/** Output: ${label} must be at least ${length} characters long */
const minLenError = (label: string, length: number) =>
  `${label} must be at least ${length} characters long`;

/** Output: ${label} must not exceed ${length} characters */
const maxLenError = (label: string, length: number) =>
  `${label} must not exceed ${length} characters`;

/** Output: ${label}' value must be greater than or equal to ${min} */
const minError = (label: string, min: number) =>
  `${label}' value must be greater than or equal to ${min}`;

/** Output: ${label}' value must be less than or equal to ${min} */
const maxError = (label: string, max: number) =>
  `${label}' value must be less than or equal to ${max}`;

export {
  usernameError,
  ipAddressError,
  emailError,
  phoneError,
  nameError,
  flexibleNameError,
  numericError,
  alphaNumericError,
  variableError,
  noWhitespaceError,
  pwdError,
  reqError,
  minLenError,
  maxLenError,
  minError,
  maxError,
};
