import {
    IDynamicFieldSchema,
    IDynamicFormKeysCategory,
    ActivityConfig,
  } from "../../..";
  
  const playSoundFieldList: IDynamicFieldSchema[] = [
    {
      name: "playSoundFrom",
      type: "select",
      label: "Play sound from",
      selectOptions: [
        { label: "System", value: "system" },
        { label: "WAV file", value: "WAV file" },
      ],
      description: "The type of sound to play",
      defaultValue: "",
    },
    {
      name: "soundToPlay",
      type: "select",
      label: "Sound to play",
      selectOptions: [
        { label: "Asterisk", value: "Asterisk" },
        { label: "Beep", value: "Beep" },
        { label: "Exclamation", value: "Exclamation" },
        { label: "Hand", value: "Hand" },
        { label: "Question", value: "Question" },
      ],
      description: "The specific sound to play",
      defaultValue: "Asterisk",
      regOptions: {
        requiredBasedOnFields: {
          initialState: false,
          conditionList: [
            {
              fields: [{ key: "playSoundFrom", value: "system" }],
            },
          ],
        },
      },
    },
    {
      name: "fileToPlay",
      type: "text",
      label: "File to play",
      description: "The full path of specific WAV file to play",
      defaultValue: "",
      regOptions: {
        requiredBasedOnFields: {
          initialState: false,
          conditionList: [
            {
              fields: [{ key: "playSoundFrom", value: "WAV file" }],
            },
          ],
        },
      },
    },
  ];
  
  const playSoundFieldCategories: IDynamicFormKeysCategory[] = [
    {
      title: "Basic",
      formFieldKeys: [
        ["playSoundFrom"],
        ["soundToPlay"],
        ["fileToPlay"],
      ],
    },
  ];
  
  const playSound: ActivityConfig = {
    fieldList: playSoundFieldList,
    fieldCategories: playSoundFieldCategories,
    fieldsToWatch: ["playSoundFrom"],
  };
  
  export default playSound;
  