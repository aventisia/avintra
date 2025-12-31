import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const expandCollapseTreeNodeInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "The tree node to expand/collapse",
    defaultValue: "",
  },
  {
    name: "foldersPath",
    type: "text",
    label: "Folders path",
    description:
      "A forward slash separated path made out of folder names leading to the tree node to expand or collapse",
    defaultValue: "",
  },
  {
    name: "useRegularExpressions",
    type: "switch",
    label: "Use regular expressions",
    description:
      "Specify whether each folder name in the path to interpret as a regular expression",
    defaultValue: false,
  },

  {
    name: "operation",
    type: "select",
    label: "Operation",
    description: "Specify whether to expand or collapse the tree node",
    selectOptions: [
      { label: "Expand", value: "expand" },
      { label: "Collapse", value: "Collapse" },
    ],
    defaultValue: "expand",
  },
];

const expandCollapseTreeNodeInWindowFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["uiElement"],
        ["foldersPath"],
        ["useRegularExpressions"],
        ["operation"],
      ],
    },
  ];
const expandCollapseTreeNodeInWindowFieldsToWatch: string[] = [];

const expandCollapseTreeNodeInWindow: ActivityConfig = {
  fieldList: expandCollapseTreeNodeInWindowFieldList,
  fieldCategories: expandCollapseTreeNodeInWindowFieldCategories,
  fieldsToWatch: expandCollapseTreeNodeInWindowFieldsToWatch,
};

export default expandCollapseTreeNodeInWindow;
