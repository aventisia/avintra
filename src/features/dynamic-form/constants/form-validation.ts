/** Checks whether email address is valid or not */
const emailRegex = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]*$/i);

/** Checks whether fields contains digits, hyphen, space, dot, hash, star and plus only */
const phoneRegex = new RegExp(/^[0-9\s\-+.#*]*$/);

/** Checks whether field contains letters and a single space between words or not */
const nameRegex = new RegExp(/^[a-zA-z]+([\s][a-zA-Z]+)*$/);

/** Checks whether field contains digits or not */
const numericRegex = new RegExp(/^[0-9]*$/);

/** Checks whether field contains letters, number and a single space between words or not */
const alphaNumericRegex = new RegExp(/^[a-zA-z0-9]+([\s][a-zA-Z0-9]+)*$/);

/** Checks whether field contains valid variable name or not */
const variableRegex = new RegExp(/^[a-zA-Z_][a-zA-Z0-9_]*$/);

/** Checks whether field contains no-whitespaces or not */
const noWhitespaceRegex = new RegExp(/^[^\s]*$/);

/** Checks whether field contains minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character or not*/
const pwdRegex = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
);

/** Output: Invalid email address */
const emailError = () => `Invalid email address`;

/** Output: ${label} can only contain digits (0-9), hyphen (-), space ( ), dot (.), hash (#), star (*) and plus (+) only */
const phoneError = (label: string) =>
  `${label} can only contain digits (0-9), hyphen (-), space ( ), dot (.), hash (#), star (*) and plus (+)`;

/** Output: ${label} can only contain letters and a single space between words */
const nameError = (label: string) =>
  `${label} can only contain letters and a single space between words`;

/** Output: ${label} can only contain digits */
const numericError = (label: string) => `${label} can only contain digits`;

/** Output: ${label} can only contain letters, number and a single space between words */
const alphaNumericError = (label: string) =>
  `${label} can only contain letters, number and a single space between words`;

/** Output: ${label} can only contain letters, number and underscore */
const variableError = (label: string) =>
  `${label} can only contain letters, number and underscore`;

/** Checks whether field contains no-whitespaces or not */
const noWhitespaceError = (label: string) =>
  `${label} does not allow whitespace`;

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
  emailRegex,
  phoneRegex,
  nameRegex,
  numericRegex,
  alphaNumericRegex,
  variableRegex,
  noWhitespaceRegex,
  pwdRegex,
  emailError,
  phoneError,
  nameError,
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
