import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const setWindowsEnvironmentVariableFieldList: IDynamicFieldSchema[] = [
    {
      name: "environmentVariableName",
      type: "select",
      label: "Environment variable name",
      selectOptions: [
        { label: "ChocolateyLastPathUpdate", value: "ChocolateyLastPathUpdate" },
        { label: "OneDrive", value: "OneDrive" },
        { label: "Path", value: "Path" },
        { label: "TEMP", value: "TEMP" },
      ],
      description: "The name of the environment variable",
      defaultValue: "Path",
    },
    {
      name: "newEnvironmentVariableValue",
      type: "text",
      label: "New environment variable value",
      description: "The value that is set to the environment variable",
      defaultValue: "",
      regOptions: {
        required: true,
      },
    },
    {
      name: "type",
      type: "select",
      label: "Type",
      selectOptions: [
        { label: "User", value: "User" },
        { label: "System", value: "System" },
      ],
      description: "The type of environment variable",
      defaultValue: "User",
    },
  ];
  
  const setWindowsEnvironmentVariableFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["environmentVariableName"],
        ["newEnvironmentVariableValue"],
        ["type"],
      ],
    },
  ];
  
  const setWindowsEnvironmentVariable: ActivityConfig = {
    fieldList: setWindowsEnvironmentVariableFieldList,
    fieldCategories: setWindowsEnvironmentVariableFieldCategories,
    fieldsToWatch: [],
  };
  
  export default setWindowsEnvironmentVariable;
  