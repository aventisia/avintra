import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const renameFilesFieldList: IDynamicFieldSchema[] = [
  {
    name: "fileToRename",
    type: "text",
    label: "File to rename",
    description:
      "The file(s) to rename. This can be a path, or a variable containing a file, a list of files, a textual path, or a list of text paths. Use the 'Get files in folder' action to populate a variable with a list of files.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "renameSchema",
    type: "select",
    label: "Rename Schema",
    description: "Specify how to rename the file(s)",
    selectOptions: [
      { label: "Set new name", value: "setNewName" },
      { label: "Add text", value: "addText" },
      { label: "Remove text", value: "removeText" },
      { label: "Replace text", value: "replaceText" },
      { label: "Change extension", value: "changeExtension" },
      { label: "Add datetime", value: "addDatetime"},
      { label: "Make sequential", value: "makeSequential" },
    ],
    defaultValue: "setNewName",
  },
  // 1. when Rename Schema = Set new name
  {
    name: "newFileName",
    type: "text",
    label: "New file name",
    description:"The new name of the file(s)",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "setNewName" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "keepExtension",
    type: "switch",
    label: "Keep extension",
    description:
      "Specifies whether to include the previous extension with the file name(s). Disable this option to add the extension to the file(s) manually",
      regOptions: {
        requiredBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "renameSchema", value: "setNewName" }],
            },
          ],
          initialState: true,
        },
      },
    defaultValue: true,
  },
  // 2. when Rename Schema = Add Text
  {
    name: "textToAdd",
    type: "text",
    label: "Text to add",
    description:"The text to add to the original file name(s)",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "addText" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "addText",
    type: "select",
    label: "Add Text",
    description: "Specify whether to add the text before or after the original name(s)",
    selectOptions: [
      { label: "After Name", value: "afterName" },
      { label: "Before Name", value: "beforeName" },
    ],
    defaultValue: "afterName",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "addText" }],
          },
        ],
        initialState: false,
      },
    },
  },
  // 3. when Rename Schema = Remove Text
  {
    name: "textToRemove",
    type: "text",
    label: "Text to remove",
    description:"The text to remove from original file name(s). This rename scheme searches each file name, and removes the entered text anywhere in the name, each time it occurs",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "removeText" }],
          },
        ],
        initialState: false,
      },
    },
  },
  // 4. when Rename Schema = Replace Text
  {
    name: "textToReplace",
    type: "text",
    label: "Text to replace",
    description:"The text to replace in the original file name(s). This rename schema searches each file name, and replaces the entered text anywhere in the name, each time it occurs",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "replaceText" }],
          },
        ],
        initialState: false,
      },
    },
  },  
  {
    name: "replaceWith",
    type: "text",
    label: "Replace with",
    description:"The text to replace the original text with",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "replaceText" }],
          },
        ],
        initialState: false,
      },
    },
  },  
  // 5. when Rename Schema = Change extension
  {
    name: "newExtension",
    type: "text",
    label: "New extension",
    description:"The text to add as the new extension for the file(s)",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "changeExtension" }],
          },
        ],
        initialState: false,
      },
    },
  },  
  // 5. when Rename Schema = Add datetime
  {
    name: "useCustomDateTime",
    type: "switch",
    label: "Use custom datetime",
    description:
      "Specifies whether to use a custom datetime",
      regOptions: {
        requiredBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "renameSchema", value: "addDatetime" }],
            },
          ],
          initialState: false,
        },
      },
    defaultValue: false,
  },
  {
    name: "customDateTime",
    type: "text",
    label: "Custom datetime",
    description:"The datetime to add to the file(s)",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "renameSchema", value: "addDatetime" },
              { key: "useCustomDateTime", value: true },
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },  
  {
    name: "datetimeToAdd",
    type: "select",
    label: "Datetime to add",
    description: "Specify what datetime value to add to the file name(s)",
    selectOptions: [
      { label: "Current datetime", value: "currentDatetime" },
      { label: "Creation time", value: "creationTime" },
      { label: "Last accessed", value: "lastAccessed" },
      { label: "Last modified", value: "lastModified" },
    ],
    defaultValue: "currentDatetime",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "renameSchema", value: "addDatetime" },
              { key: "useCustomDateTime", value: false },
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "addDatetime",
    type: "select",
    label: "Add datetime",
    description: "Specify whether to add datetime before or after the original name(s)",
    selectOptions: [
      { label: "After name", value: "afterName" },
      { label: "Before name", value: "beforeName" },
    ],
    defaultValue: "afterName",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "renameSchema", value: "addDatetime" }            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "separator",
    type: "select",
    label: "Separator",
    description: "Specify what to use to separate the original file name and the datetime value added, including the option to not use a separator",
    selectOptions: [
      { label: "Nothing", value: "nothing" },
      { label: "Space", value: "space" },
      { label: "Dash", value: "dash" },
      { label: "Period", value: "period" },
      { label: "Underscore", value: "underscore" },
    ],
    defaultValue: "nothing",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "renameSchema", value: "addDatetime" },       
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "datetimeFormat",
    type: "text",
    label: "Datetime format",
    description:"The format of the datetime value to add to the file name, such as MM/dd/yyyy for date, and hh:mm:sstt for time",
    defaultValue: "yyyyMMdd",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "addDatetime" }],
          },
        ],
        initialState: false,
      },
    },
  },  
  // 6. when Rename Schema = Make sequential
  {
    name: "addNumberTo",
    type: "switch",
    label: "Add number to",
    description:
      "Specifies whether to add the number to the existing file name(s) or a new name",
      regOptions: {
        requiredBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "renameSchema", value: "makeSequential" }],
            },
          ],
          initialState: false,
        },
      },
    defaultValue: true,
  },
  {
    name: "newFileNameSeq",
    type: "text",
    label: "New file name",
    description:"The new name of the file(s)",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "renameSchema", value: "makeSequential" },
              { key: "addNumberTo", value: false },
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },  
  {
    name: "addNumberToSeq",
    type: "select",
    label: "Add number to ",
    description: "Specify whether to add the number before or after the original name(s) or a new base name",
    selectOptions: [
      { label: "After Name", value: "afterName" },
      { label: "Before Name", value: "beforeName" },
    ],
    defaultValue: "afterName",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "makeSequential" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "startNumberingAt",
    type: "text",
    label: "Start numbering at",
    description:"The starting number value",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "makeSequential" }],
          },
        ],
        initialState: false,
      },
    },
  },  
  {
    name: "incrementBy",
    type: "text",
    label: "Increment by",
    description:"The number to increment the starting value by",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "makeSequential" }],
          },
        ],
        initialState: false,
      },
    },
  },  
  {
    name: "separatorSeq",
    type: "select",
    label: "Separator",
    description: "Specify what to use to separate the original file name and the datetime value added, including the option to not use a separator",
    selectOptions: [
      { label: "Nothing", value: "nothing" },
      { label: "Space", value: "space" },
      { label: "Dash", value: "dash" },
      { label: "Period", value: "period" },
      { label: "Underscore", value: "underscore" },
    ],
    defaultValue: "nothing",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "renameSchema", value: "makeSequential" },       
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "usePadding",
    type: "switch",
    label: "Use padding",
    description:
      "Specifies whether to use padding",
      regOptions: {
        requiredBasedOnFields: {
          conditionList: [
            {
              fields: [{ key: "renameSchema", value: "makeSequential" }],
            },
          ],
          initialState: false,
        },
      },
    defaultValue: false,
  },
  {
    name: "makeEachNumberAtleast",
    type: "text",
    label: "Make each number at least",
    description:"The minimum length for each number added",
    defaultValue: "3",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "renameSchema", value: "makeSequential" }],
          },
        ],
        initialState: false,
      },
    },
  },  






  {
    name: "ifFileExists",
    type: "select",
    label: "If file exists",
    description:
      "Specifies what to do if a file with the same name already exists in the destination folder.",
    selectOptions: [
      { label: "Do nothing", value: "doNothing" },
      { label: "Overwrite", value: "overwrite" },
    ],
    defaultValue: "doNothing",
    regOptions: {
      required: true
    },
  },
  // output 
  {
    name: "o_RenamedFilesOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The renamed file(s) as a list files",
    defaultValue: "RenamedFiles",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_RenamedFilesSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_RenamedFilesSwitch",
    type: "output-switch-field",
    label: "RenamedFiles",
    defaultValue: true,
  },
];

const renameFilesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["fileToRename"], 
      ["addNumberTo"],
      ["renameSchema"], 
      ["newFileName"], 
      ["keepExtension"], 
      ["textToAdd"],
      ["addText"],
      ["textToRemove"],
      ["textToReplace"],
      ["replaceWith"],
      ["newExtension"],
      ["useCustomDateTime"],
      ["customDateTime"],
      ["datetimeToAdd"],
      ["addDatetime"],
      ["separator"],
      ["datetimeFormat"],
      ["newFileNameSeq"],
      ["addNumberToSeq"],
      ["startNumberingAt"],
      ["incrementBy"],
      ["separatorSeq"],
      ["usePadding"],
      ["makeEachNumberAtleast"],
      ["ifFileExists"]
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_RenamedFilesOutput", "o_RenamedFilesSwitch"]],
  },
];

const renameFiles: ActivityConfig = {
  fieldList: renameFilesFieldList,
  fieldCategories: renameFilesFieldCategories,
  fieldsToWatch: ["renameSchema", "useCustomDateTime", "addNumberTo", "o_RenamedFilesOutput", "o_RenamedFilesSwitch"],
};

export default renameFiles;
