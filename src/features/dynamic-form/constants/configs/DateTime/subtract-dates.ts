import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const subtractDatesFieldList: IDynamicFieldSchema[] = [
  {
    name: "fromDate",
    type: "text",
    label: "From date",
    description:
      "The datetime to subtract the first datetime from. This will be the base datetime, so generally put the later date/time in this attribute",
    defaultValue: "",
  },
  {
    name: "subtractDate",
    type: "text",
    label: "Subtract date",
    description: "The datetime to subtract",
    defaultValue: "",
  },
  {
    name: "getDifferenceIn",
    type: "select",
    label: "Get difference in",
    description: "The unit of time to express the difference in",
    selectOptions: [
      { label: "Seconds", value: "seconds" },
      { label: "Minutes", value: "minutes" },
      { label: "Hours", value: "hours" },
      { label: "Days", value: "days" },
    ],
    defaultValue: "Days",
  },
  //   output
  {
    name: "o_timeDifferenceOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The difference in time as a numeric value",
    defaultValue: "TimeDifference",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_timeDifferenceSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_timeDifferenceSwitch",
    type: "output-switch-field",
    label: "TimeDifference",
    defaultValue: true,
  },
];

const subtractDatesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["fromDate"], ["subtractDate"], ["getDifferenceIn"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_timeDifferenceOutput", "o_timeDifferenceSwitch"]],
  },
];
const subtractDates: ActivityConfig = {
  fieldList: subtractDatesFieldList,
  fieldCategories: subtractDatesFieldCategories,
  fieldsToWatch: ["o_timeDifferenceOutput", "o_timeDifferenceSwitch"],
};

export default subtractDates;
