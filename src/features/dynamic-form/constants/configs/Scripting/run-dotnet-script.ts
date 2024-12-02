import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const runDotNetScriptFieldList: IDynamicFieldSchema[] = [
  {
    name: "language",
    type: "select",
    label: "Language",
    description: "The language of the script",
    selectOptions: [
      { label: "C#", value: "c#" },
      { label: "VB.NET", value: "VB.NET" },
    ],
    defaultValue: "C#", 
  },
  {
    name: "dotNetScriptImports",
    type: "codeEditor",
    label: ".NET script imports",
    language:"csharp",
    description: "The .NET script imports to be included in the script",
    defaultValue: "",
  },
  {
    name: "referencesToBeLoaded",
    type: "text",
    label: "References to be loaded",
    description:
      "The root path where .NET dynamic link libraries (.dll files) references are located",
    defaultValue: "",
  },
  {
    name: "scriptParameters",
    type: "text",
    label: "Script parameters",
    description: "Setting the values of the parameters defined in the script",
    defaultValue: "",
  },
  {
    name: "dotNetCodeToRun",
    type: "codeEditor",
    label: ".NET code to run",
    language:"csharp",
    description: "The .NET code to run",
    defaultValue: "",
  },
  {
    name: "scriptDescription",
    type: "textarea",
    label: "Script description",
    description:
      "The optional description of the .NET script. If there is no script description, the default will be shown",
    defaultValue: "",
  },
];

const runDotNetScriptFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["language"],
      ["dotNetScriptImports"],
      ["referencesToBeLoaded"],
      ["scriptParameters"],
      ["dotNetCodeToRun"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [["scriptDescription"]],
  },
];

const runDotNetScript: ActivityConfig = {
  fieldList: runDotNetScriptFieldList,
  fieldCategories: runDotNetScriptFieldCategories,
  fieldsToWatch: [],
};

export default runDotNetScript;
