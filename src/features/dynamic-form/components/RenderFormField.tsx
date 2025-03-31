/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  IDynamicFieldSchema,
  DynamicControl,
  alphaNumericError,
  alphaNumericRegex,
  emailError,
  emailRegex,
  maxError,
  maxLenError,
  minError,
  minLenError,
  nameError,
  nameRegex,
  noWhitespaceError,
  noWhitespaceRegex,
  numericError,
  numericRegex,
  phoneError,
  phoneRegex,
  reqError,
  variableError,
  variableRegex,
} from "..";
import { RegisterOptions } from "react-hook-form";
import { isPossiblePhoneNumber } from "react-phone-number-input";
import { FormField } from "@/react-toolkit/ui/form/FormField";
import { FormItem } from "@/react-toolkit/ui/form/FormItem";
import { FormMessage } from "@/react-toolkit/ui/form/FormMessage";

// Create error messages for required, minLength, maxLength
export const getFormRules = (
  fData: IDynamicFieldSchema,
  form: any,
): RegisterOptions | undefined => {
  const formattedRules: RegisterOptions = {};
  const options = fData.regOptions;

  // Required
  if (options?.required) {
    formattedRules.required = {
      value: true,
      message: reqError(fData.label),
    };
  }

  // Required based on field key-value
  if (options?.requiredBasedOnFields) {
    let isRequiredFinal = false;
    let hasToUseInitialState = false; // If field value is undefined then this will be set to true

    // Loop through each field
    options?.requiredBasedOnFields.conditionList.forEach((item) => {
      let isRequired = false;
      let trueCount = 0;
      const logicalOperator = item.logicalOperator
        ? item.logicalOperator
        : "OR";
      switch (logicalOperator) {
        case "OR":
          item.fields.forEach((field) => {
            hasToUseInitialState = form.getValues(field.key) === undefined;
            if (!isRequired)
              isRequired = form.getValues(field.key) === field.value;
          });
          break;
        case "AND":
          item.fields.forEach((field) => {
            hasToUseInitialState = form.getValues(field.key) === undefined;
            if (form.getValues(field.key) === field.value) trueCount++;
          });
          if (trueCount === item.fields.length) isRequired = true;
          break;
      }

      // Set final isRequired
      if (!isRequiredFinal) isRequiredFinal = isRequired;
    });

    // Final result
    const finalResult = hasToUseInitialState
      ? options?.requiredBasedOnFields?.initialState
      : isRequiredFinal;

    // Set fieldData' required to show red astrik sign
    options.required = finalResult;

    // Set field container' display none/block
    fData.visible = finalResult;

    // Set required rule
    formattedRules.required = {
      value: finalResult,
      message: reqError(fData.label),
    };
  }

  // Disabled based on field key-value
  if (options?.disabledBasedOnFields) {
    let isDisabledFinal = false;
    let hasToUseInitialState = false; // If field value is undefined then this will be set to true

    // Loop through each field
    options?.disabledBasedOnFields.conditionList.forEach((item) => {
      let isDisabled = false;
      let trueCount = 0;
      const logicalOperator = item.logicalOperator
        ? item.logicalOperator
        : "OR";
      switch (logicalOperator) {
        case "OR":
          item.fields.forEach((field) => {
            hasToUseInitialState = form.getValues(field.key) === undefined;
            if (!isDisabled)
              isDisabled = form.getValues(field.key) === field.value;
          });
          break;
        case "AND":
          item.fields.forEach((field) => {
            hasToUseInitialState = form.getValues(field.key) === undefined;
            if (form.getValues(field.key) === field.value) trueCount++;
          });
          if (trueCount === item.fields.length) isDisabled = true;
          break;
      }

      // Set final isDisabled
      if (!isDisabledFinal) isDisabledFinal = isDisabled;
    });

    // Final result
    const finalResult = hasToUseInitialState
      ? options?.disabledBasedOnFields?.initialState
      : isDisabledFinal;

    // Set fieldData' required to show red astrik sign
    options.disabled = finalResult;

    // Set field container' display none/block
    // fData.visible = finalResult;

    // Set required rule
    // formattedRules.required = {
    //   value: finalResult,
    //   message: reqError(fData.label),
    // };
    formattedRules.disabled = finalResult;
  }

  // Min (number)
  if (options?.min) {
    formattedRules.min = {
      value: options?.min,
      message: minError(fData.label, options?.min),
    };
  }

  // Max (number)
  if (options?.max) {
    formattedRules.max = {
      value: options?.max,
      message: maxError(fData.label, options?.max),
    };
  }

  // Min length (string)
  if (options?.minLength) {
    formattedRules.minLength = {
      value: options?.minLength,
      message: minLenError(fData.label, options?.minLength),
    };
  }

  // Max length (string)
  if (options?.maxLength) {
    formattedRules.maxLength = {
      value: options?.maxLength,
      message: maxLenError(fData.label, options?.maxLength),
    };
  }

  // Name regex
  if (options?.nameRegex) {
    formattedRules.pattern = {
      value: nameRegex,
      message: nameError(fData.label),
    };
  }

  // Numeric regex
  if (options?.numericRegex) {
    formattedRules.pattern = {
      value: numericRegex,
      message: numericError(fData.label),
    };
  }

  // AlphaNumeric regex
  if (options?.alphaNumericRegex) {
    formattedRules.pattern = {
      value: alphaNumericRegex,
      message: alphaNumericError(fData.label),
    };
  }

  // Email regex
  if (options?.emailRegex) {
    formattedRules.pattern = {
      value: emailRegex,
      message: emailError(),
    };
  }

  // Phone regex
  if (options?.phoneRegex) {
    formattedRules.pattern = {
      value: phoneRegex,
      message: phoneError(fData.label),
    };
  }

  // PhoneInput
  if (options?.validPhoneNumber) {
    formattedRules.validate = (value) =>
      isPossiblePhoneNumber(`${value}`) || "Invalid phone number";
  }

  // Variable regex
  if (options?.variableRegex) {
    formattedRules.pattern = {
      value: variableRegex,
      message: variableError(fData.label),
    };
  }

  // No whitespace regex
  if (options?.noWhitespaceRegex) {
    formattedRules.pattern = {
      value: noWhitespaceRegex,
      message: noWhitespaceError(fData.label),
    };
  }
  return formattedRules;
};

// Get FormField
const renderFormField = (fieldData: IDynamicFieldSchema, form: any) => {
  return (
    <FormField
      key={fieldData.name}
      control={form.control}
      name={fieldData.name}
      rules={getFormRules(fieldData, form)}
      defaultValue={fieldData.defaultValue}
      disabled={fieldData.disabled || fieldData.regOptions?.disabled}
      render={({ field }) => (
        <FormItem className={fieldData.visible ? "block" : "hidden"}>
          <DynamicControl form={form} field={field} fData={fieldData} />
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export { renderFormField };
