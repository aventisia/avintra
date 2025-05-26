/* eslint-disable @typescript-eslint/no-explicit-any */

import { ISelectOption } from "@aventisia/ui/types";

/** Accepted control/input types for DynamicForm component */
type ControlType =
  | "text"
  | "number"
  | "password"
  | "email"
  | "file"
  | "color"
  | "time"
  | "otp"
  | "phone"
  | "select"
  | "flow-select-combobox"
  | "multi-selector"
  | "tag-input"
  | "combobox"
  | "checkbox"
  | "switch"
  | "radio-group"
  | "date"
  | "slider"
  | "textarea"
  | "ui-element-selector"
  | "codeEditor"
  | "output-text-field"
  | "output-switch-field";

/** Accepted language types for DynamicForm codeEditor component */
type LanguageType =
  | "javascript"
  | "typescript"
  | "sql"
  | "python"
  | "cpp"
  | "powershell"
  | "html"
  | "vbscript"
  | "csharp"
  | "xml";

interface IRequiredBasedOnFields {
  conditionList: {
    fields: { key: string; value: any }[];
    logicalOperator?: "AND" | "OR";
  }[];
  initialState: boolean;
}

interface IRegOptions {
  required?: boolean;
  /** list of Field's key and value can be passed to make field required*/
  requiredBasedOnFields?: IRequiredBasedOnFields;
  /** To disable a field */
  disabled?: boolean;
  /** list of Field's key and value can be passed to make field disabled* */
  disabledBasedOnFields?: IRequiredBasedOnFields;
  /** To control number' min limit */
  min?: number;
  /** To control number' max limit */
  max?: number;
  /** To control string min length */
  minLength?: number;
  /** To control string max length */
  maxLength?: number;
  /** To accept only valid email address */
  emailRegex?: boolean;
  /** To accept only digits (0-9), hyphen (-), space ( ), dot (.), hash (#), star (*) and plus (+) */
  phoneRegex?: boolean;
  /** To accept valid phone number basis isPossiblePhoneNumber of react-phone-number-input */
  validPhoneNumber?: boolean;
  /** To accept only letters and a single space between words */
  nameRegex?: boolean;
  /** To accept only digits */
  numericRegex?: boolean;
  /** To accept only letters, number and a single space between words */
  alphaNumericRegex?: boolean;
  /** To accept only letters, number and underscore */
  variableRegex?: boolean;
  /** To not accept whitespace */
  noWhitespaceRegex?: boolean;
  /** To accept only minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character*/
  pwdRegex?: boolean;
}

interface IDynamicFieldSchema {
  label: string;
  name: string;
  type: ControlType;
  defaultValue: any;
  /** Set it to true if field is not required to be shown on to the user.
   * It does not remove the field from form. It only toggles field's container
   * (div) css display property none/block
   */
  visible?: boolean;
  className?: string;
  /** classes for FormField's container (div). To set the set the fix width of field */
  containerClassName?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  readonly?: boolean;
  /** It Can be used for 'select', 'multi-selector' and 'radio' field type */
  selectOptions?: ISelectOption[];
  /** Short way to defind rules for RegisterOptions */
  regOptions?: IRegOptions;
  language?: LanguageType;
}

interface IDynamicFormKeysCategory {
  title: string;
  formFieldKeys: string[][];
}

interface IDynamicFormCategory {
  title: string;
  formFields: Array<Array<IDynamicFieldSchema>>;
}

interface ActivityConfig {
  fieldList: IDynamicFieldSchema[];
  fieldCategories: IDynamicFormKeysCategory[];
  fieldsToWatch: string[];
}

interface IFormValuesToFill {
  key: string;
  value: string | number | any;
}

export {
  type ControlType,
  type IRegOptions,
  type IDynamicFieldSchema,
  type IDynamicFormKeysCategory,
  type IDynamicFormCategory,
  type ActivityConfig,
  type IFormValuesToFill,
};
