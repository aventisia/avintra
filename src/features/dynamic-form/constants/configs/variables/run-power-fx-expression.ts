import {
    ActivityConfig,
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
  } from "../../..";
  
  const runPowerFxExpressionFieldList: IDynamicFieldSchema[] = [
    {
      name: "runPowerFxExpression",
      type: "textarea",
      label: "Expression",
      description: "Run the provided Power Fx expression",      
      defaultValue: "",
    },
  ];
  
  const runPowerFxFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [["runPowerFxExpression"],],
    },
  ];
  
  const runPowerFxExpression: ActivityConfig = {
    fieldList: runPowerFxExpressionFieldList,
    fieldCategories: runPowerFxFieldCategories,
    fieldsToWatch: [],
  };
  
  export default runPowerFxExpression;
  