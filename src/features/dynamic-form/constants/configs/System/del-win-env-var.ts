import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const deleteWindowsEnvironmentVariableFieldList: IDynamicFieldSchema[] = [
    {
      name: "environmentVariableName",
      type: "text",
      label: "Environment variable name",
      description: "The name of the environment variable to delete",
      defaultValue: "Path",
    },
    {
      name: "type",
      type: "select",
      label: "Type",
      selectOptions: [
        { label: "User", value: "User" },
        { label: "System", value: "System" },
      ],
      description: "The type of environment variable to delete",
      defaultValue: "User",
    },
  ];
  
  const deleteWindowsEnvironmentVariableFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["environmentVariableName"],
        ["type"],
      ],
    },
  ];
  
  const deleteWindowsEnvironmentVariable: ActivityConfig = {
    fieldList: deleteWindowsEnvironmentVariableFieldList,
    fieldCategories: deleteWindowsEnvironmentVariableFieldCategories,
    fieldsToWatch: [],
  };
  
  export default deleteWindowsEnvironmentVariable;
  