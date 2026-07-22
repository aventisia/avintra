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
const pwdRegex = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);

export {
  emailRegex,
  phoneRegex,
  nameRegex,
  numericRegex,
  alphaNumericRegex,
  variableRegex,
  noWhitespaceRegex,
  pwdRegex,
};
