import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const synchronizeDirectoriesFieldList: IDynamicFieldSchema[] = [
  {
    name: "FTPConnection",
    type: "text",
    label: "FTP connection",
    description:
      "The FTP connection to work with. This variable must have been previously specified in an Open FTP connection action",
    defaultValue: "",
  },

  {
    name: "synchronizationDirection",
    type: "select",
    label: "Synchronization direction",
    selectOptions: [
      {
        label: "Remote -> local (Download)",
        value: "Remote -> local (Download)",
      },
      { label: "Local -> remote (Upload)", value: "Local -> remote (Upload)" },
    ],

    description:
      "Direction of the Synchronization method. Whether the local folder will be synchronized to the remote directory (DOWNLOAD) or the remote directory will be synchronized to the local folder (UPLOAD)",
    defaultValue: "Remote -> local (Download)",
  },
  {
    name: "filesToSync",
    type: "select",
    label: "Files to sync",
    selectOptions: [
      { label: "All files", value: "All files" },
      {
        label: "Only files matching the file filter",
        value: "Only files matching the file filter",
      },
      {
        label: "Only files not matching the file filter",
        value: "Only files not matching the file filter",
      },
    ],

    description:
      "Choose whether you want to synchronize all files, or you want to use a file filter to include or exclude a specific set of files",
    defaultValue: "All files",
  },
  {
    name: "fileFilter",
    type: "text",
    label: "File filter",
    description:
      "File-name pattern that controls which files will be included or excluded. This option allows wildcards such as '.txt', 'document?.doc'. The option also allows for multiple filters by using coma as a separator, .txt,*.pdf,document?",
    defaultValue: "*",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "filesToSync", value: "Only files matching the file filter" },
              { key: "filesToSync", value: "Only files not matching the file filter" },
            ],
            logicalOperator: "OR"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "localFolder",
    type: "text",
    label: "Local folder",

    description: "Name of the local folder to be synchronized",
    defaultValue: "",
  },
  {
    name: "FTPDirectory",
    type: "text",
    label: "FTP directory",
    description: "Name of the FTP directory to be synchronized",
    defaultValue: "/",
  },
  {
    name: "deleteIfSourceIsAbsent",
    type: "switch",
    label: "Delete if source is absent",

    description:
      "This option will delete a file or folder that exists in the target directory and not the source.",
    defaultValue: false,
  },
  {
    name: "includeSubdirectories",
    type: "switch",
    label: "Include subdirectories",

    description:
      "This option will include subdirectories in the synchronization process.",
    defaultValue: true,
  },
  {
    name: "timeDifferenceInHours",
    type: "text",
    label: "Time difference in hours",

    description:
      "Time difference in hours of the remote server in case it operates on a different Time Zone.",
    defaultValue: "0",
  },
  {
    name: "timeDifferenceInMinutes",
    type: "text",
    label: "Time difference in minutes",
    description:
      "Time difference in Minutes of the remote server in case it operates on a different Time Zone.",
    defaultValue: "0",
  },

  {
    name: "timeDifferencAhead",
    type: "switch",
    label: "Time difference ahead",

    description: "Specify whether the server's time zone is ahead or not.",
    defaultValue: true,
  },
  
  // Output
  // Local Remote Download
  {
    name: "o_filesAddedOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "List of files that initially existed in the source and after the synchronization process were added to the target.",
    defaultValue: "filesAdded",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_filesAddedSwitch", value: false }],
          },
        ],
        initialState: false,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Remote -> local (Download)"}]
          }
        ],
        initialState: true
      }
    },
  },
  {
    name: "o_filesAddedSwitch",
    type: "output-switch-field",
    label: "filesAdded",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Remote -> local (Download)"}]
          }
        ],
        initialState: true
      }
    }
  },

  {
    name: "o_filesModifiedOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
    "List of files that initially existed in both the source and the target and after the synchronization process were added to the target.",
    defaultValue: "FilesModified",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_filesModifiedSwitch", value: false }],
          },
        ],
        initialState: false,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Remote -> local (Download)"}]
          }
        ],
        initialState: true
      }
    },
  },
  {
    name: "o_filesModifiedSwitch",
    type: "output-switch-field",
    label: "FilesModified",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Remote -> local (Download)"}]
          }
        ],
        initialState: true
      }
    }
  },
  
  {
    name: "o_filesDeletedOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "List of FTP files that initially existed in the target directory and after the synchronization process were deleted.",
    defaultValue: "FilesDeleted",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_filesDeletedSwitch", value: false }],
          },
        ],
        initialState: false,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Remote -> local (Download)"}]
          }
        ],
        initialState: true
      }
    },
  },
  {
    name: "o_filesDeletedSwitch",
    type: "output-switch-field",
    label: "FilesDeleted",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Remote -> local (Download)"}]
          }
        ],
        initialState: true
      }
    }
  },

  // Local Remote Upload
  {
    name: "o_ftpFilesAddedOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "List of FTP files that initially existed in the target directory and after the synchronization process were added to the target.",
    defaultValue: "FtpFilesAdded",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_ftpFilesAddedSwitch", value: false }],
          },
        ],
        initialState: false,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Local -> remote (Upload)"}]
          }
        ],
        initialState: false
      }
    },
  },
  {
    name: "o_ftpFilesAddedSwitch",
    type: "output-switch-field",
    label: "FtpFilesAdded",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Local -> remote (Upload)"}]
          }
        ],
        initialState: false
      }
    }
  },

  {
    name: "o_ftpFilesModifiedOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
    "List of FTP files that initially existed in both the source and the target and after the synchronization process were added to the target.",
    defaultValue: "FtpFilesModified",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_ftpFilesModifiedSwitch", value: false }],
          },
        ],
        initialState: false,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Local -> remote (Upload)"}]
          }
        ],
        initialState: false
      }
    },
  },
  {
    name: "o_ftpFilesModifiedSwitch",
    type: "output-switch-field",
    label: "FtpFilesModified",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Local -> remote (Upload)"}]
          }
        ],
        initialState: false
      }
    }
  },

  {
    name: "o_ftpFilesDeletedOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "List of FTP files that initially existed in the target directory and after the synchronization process were deleted.",
    defaultValue: "FtpFilesDeleted",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_ftpFilesDeletedSwitch", value: false }],
          },
        ],
        initialState: false,
      },
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Local -> remote (Upload)"}]
          }
        ],
        initialState: false
      }
    },
  },
  {
    name: "o_ftpFilesDeletedSwitch",
    type: "output-switch-field",
    label: "FtpFilesDeleted",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields : [{key: "synchronizationDirection", value: "Local -> remote (Upload)"}]
          }
        ],
        initialState: false
      }
    }
  },
];

const synchronizeDirectoriesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["FTPConnection"],
      ["synchronizationDirection"],
      ["filesToSync"],
      ["fileFilter"],
      ["localFolder"],
      ["FTPDirectory"],
      ["deleteIfSourceIsAbsent"],
      ["includeSubdirectories"],
      ["timeDifferenceInHours"],
      ["timeDifferenceInMinutes"],
      ["timeDifferencAhead"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["o_filesAddedOutput", "o_filesAddedSwitch"],
      ["o_filesModifiedOutput", "o_filesModifiedSwitch"],
      ["o_filesDeletedOutput", "o_filesDeletedSwitch"],
      ["o_ftpFilesAddedOutput", "o_ftpFilesAddedSwitch"],
      ["o_ftpFilesModifiedOutput","o_ftpFilesModifiedSwitch"],
      ["o_ftpFilesDeletedOutput", "o_ftpFilesDeletedSwitch"]
    ],
  },
];

const synchronizeDirectories: ActivityConfig = {
  fieldList: synchronizeDirectoriesFieldList,
  fieldCategories: synchronizeDirectoriesFieldCategories,
  fieldsToWatch: [
    "filesToSync", 
    "synchronizationDirection", 
    "o_filesAddedOutput", 
    "o_filesAddedSwitch", 
    "o_filesModifiedOutput", 
    "o_filesModifiedSwitch", 
    "o_filesDeletedOutput", 
    "o_filesDeletedSwitch",
    "o_ftpFilesAddedOutput",
    "o_ftpFilesAddedSwitch",
    "o_ftpFilesModifiedOutput",
    "o_ftpFilesModifiedSwitch",
    "o_ftpFilesDeletedOutput",
    "o_ftpFilesDeletedSwitch"
  ],
};

export default synchronizeDirectories;
