/** Checks whether email address is valid or not */
const emailRegex = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]*$/i);

/** Checks whether fields contains digits, hyphen, space, dot, hash, star and plus only */
const phoneRegex = new RegExp(/^[0-9\s\-+.#*]*$/);

/** Checks whether field contains letters and a single space between words or not */
const nameRegex = new RegExp(/^[a-zA-z]+([\s][a-zA-Z]+)*$/);

/**
 * Accepts everything except special characters, but allows hyphen and underscore.
 * Matches only letters, numbers, hyphen, and underscore.
 * Examples of valid matches: 'hello_world-123', 'Test-Name_42'
 * Examples of invalid matches: 'hello@world!', 'test$name'
 */
const flexibleNameRegex = new RegExp(/^[a-zA-Z0-9_\- ]*$/);

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

/**
 * A regular expression to validate positive floating-point numbers.
 *
 * This regex matches:
 * - Numbers with optional decimal points (e.g., `123`, `123.45`, `.45`)
 * - At least one digit is required either before or after the decimal point.
 * - Does not allow negative numbers or non-numeric characters.
 *
 * Examples of valid matches:
 * - `123`
 * - `0.456`
 * - `.789`
 *
 * Examples of invalid matches:
 * - `-123` (negative number)
 * - `abc` (non-numeric characters)
 * - `123.` (trailing decimal point without digits)
 */
const positiveFloatNumberRegex = new RegExp(/^\d*\.?\d+$/);

/** Checks whether field contains valid IPv4 address or not */
const ipv4Regex =
  /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;

/** Checks whether field contains valid IPv6 address or not */
const ipv6Regex =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/;

/** Checks whether field contains valid username/hostname or not */
const usernameRegex = /^[A-Za-z0-9_-]+$/;

/** Checks whether field contains valid GUID/UUID or not */
const uuidv4Regex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export {
  emailRegex,
  phoneRegex,
  nameRegex,
  flexibleNameRegex,
  numericRegex,
  alphaNumericRegex,
  variableRegex,
  noWhitespaceRegex,
  pwdRegex,
  positiveFloatNumberRegex,
  ipv4Regex,
  ipv6Regex,
  usernameRegex,
  uuidv4Regex,
};
