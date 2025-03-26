import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const addToDataTimeFieldList: IDynamicFieldSchema[] = [
  {
    name: "dateTime",
    type: "text",
    label: "Date Time",
    description: "The datetime value to alter",
    defaultValue: "",
  },
  {
    name: "add",
    type: "number",
    label: "Add",
    description:
      "The numeric value to add. To subtract a time, the value should be negative. For example, add -7 days here to go back one week",
    defaultValue: "",
  },
  {
    name: "timeUnit",
    type: "select",
    label: "Time unit",
    description: "The time unit the time to add represents",
    selectOptions: [
      { label: "Seconds", value: "seconds" },
      { label: "Minutes", value: "minutes" },
      { label: "Hours", value: "hours" },
      { label: "Days", value: "days" },
      { label: "Months", value: "months" },
      { label: "Years", value: "years" },
    ],
    defaultValue: "Seconds",
  },
  // output
  {
    name: "o_resultedDateOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The new, altered datetime value",
    defaultValue: "ResultedDate",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_resultedDateSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_resultedDateSwitch",
    type: "output-switch-field",
    label: "ResultedDate",
    defaultValue: true,
  },
];

const addToDateTimeFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["dateTime"], ["add"], ["timeUnit"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_resultedDateOutput", "o_resultedDateSwitch"]],
  },
];
const addToDateTime: ActivityConfig = {
  fieldList: addToDataTimeFieldList,
  fieldCategories: addToDateTimeFieldCategories,
  fieldsToWatch: ["o_resultedDateOutput", "o_resultedDateSwitch"],
};

export default addToDateTime;
