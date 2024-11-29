/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  IDynamicFormCategory,
} from "..";

const getFormFields = (
  action: string,
  formFieldList: IDynamicFieldSchema[],
  selectedActionFormCategories: IDynamicFormKeysCategory[],
  doNotEditFormFieldKeys?: string[],
) => {
  const finalCategories: IDynamicFormCategory[] = [];

  // Filter fields basis category and keys
  selectedActionFormCategories.forEach((category) => {
    const finalFields: Array<Array<IDynamicFieldSchema>> = [];
    category.formFieldKeys.forEach((keys) => {
      // Filter field
      const filteredField = formFieldList.filter((element) => {
        return keys.indexOf(element.name) >= 0;
      });

      if (filteredField) {
        // Modify fields props
        filteredField.forEach((element) => {
          // Set visible prop to true for all crud ops
          element.visible = true;

          // RecordData property has value
          switch (action) {
            case "view":
              element.disabled = true;
              break;
            case "edit":
              element.disabled = element.readonly
                ? false
                : doNotEditFormFieldKeys?.includes(element.name);
              break;
            case "insert":
              element.disabled = false;
              break;
          }
        });
        // Push to final list
        finalFields.push(filteredField);
      }
    });
    // Add finalfields to categories
    if (finalFields.length > 0) {
      finalCategories.push({
        title: category.title,
        formFields: finalFields,
      });
    }
  });

  return finalCategories;
};

export { getFormFields };
