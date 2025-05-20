import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const convertDatetimeToTextFieldList: IDynamicFieldSchema[] = [
    {
      name: "datetimeToConvert",
      type: "text",
      label: "Datetime to convert",
      description:
        "The datetime value to convert to text",
      defaultValue: "",
    },
    {
        name: "formatToUse", // to watch
        type: "select",
        label: "Format to use",
        selectOptions: [
          { label: "Standard", value: "standard" },
          { label: "Custom", value: "custom" },
        ],
        description:
          "Specify whether to use a standard datetime format, or create a custom one",
        defaultValue: "standard",
        regOptions: {
          required: true,
        },
    },
    {
        name: "standardFormat", // to watch
        type: "select",
        label: "Standard Format",
        selectOptions: [
          { label: "Short Date", value: "shortDate" },
          { label: "Long Date", value: "longDate" },
          { label: "Short Time", value: "shortTime" },
          { label: "Long Time", value: "longTime" },
          { label: "Full datetime (short time)", value: "fullDatetime(shortTime)" },
          { label: "Full datetime (long time)", value: "fullDatetime(longTime)" },
          { label: "General datetime (short time)", value: "generalDatetime(shortTime)" },
          { label: "General datetime (long time)", value: "generalDatetime(longTime)" },
          { label: "Sortable datetime", value: "sortableDatetime" },
        ],
        description:
          "The standard datetime format the action uses to display the datetime value.",
        defaultValue: "shortDate",
        regOptions: {
            requiredBasedOnFields: {
                conditionList: [
                    {
                        fields: [{key: "formatToUse", value:"standard"}]
                    }
                ],
                initialState: false,
            },
            required: true,
        },
    },
    {
      name: "customFormat",
      type: "text",
      label: "Custom",
      description:
        "The format in which the date is stored in the text. A custom format can be expressed as, for example, yyyyMMdd for date and hhmmss for time",
      defaultValue: "",
      regOptions: {
        requiredBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "formatToUse", value: "custom" }],
            },
          ],
          initialState: false,
        },
      },
    },
    //   output
    {
      name: "o_dateTimetoTextOutput", //to watch
      type: "output-text-field",
      label: "",
      description: "The formatted datetime as a text value",
      defaultValue: "formattedDateTime",
      regOptions: {
        disabledBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "o_dateTimetoTextSwitch", value: false }],
            },
          ],
          initialState: false,
        },
      },
    },
    {
      name: "o_dateTimetoTextSwitch",
      type: "output-switch-field",
      label: "DatetimeToText",
      defaultValue: true,
    },
  ];
  
  const convertDatetimeToTextFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["datetimeToConvert"],
        ["formatToUse"],
        ["standardFormat"],
        ["customFormat"],
      ],
    },
    {
      title: "Output",
      formFieldKeys: [["o_dateTimetoTextOutput", "o_dateTimetoTextSwitch"]],
    },
  ];
  
  const convertDatetimeToText: ActivityConfig = {
    fieldList: convertDatetimeToTextFieldList,
    fieldCategories: convertDatetimeToTextFieldCategories,
    fieldsToWatch: ["o_dateTimetoTextOutput", "o_dateTimetoTextSwitch", "formatToUse", "standardFormat", "customFormat"],
  };
  
  export default convertDatetimeToText;
  