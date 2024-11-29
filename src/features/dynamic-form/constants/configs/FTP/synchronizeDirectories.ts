import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const synchronizeDirectoriesFieldList: IDynamicFieldSchema[] = [
  {
    name: "FTPConnection",
    type: "select",
    label: "FTP connection",
    selectOptions: [],

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
        label: " Only files matching the file filter",
        value: "Only files matching the file filter",
      },
      {
        label: "ASCOnly files not matching the file filterII",
        value: "Only files not matching the file filter",
      },
    ],

    description:
      "Choose whether you want to synchronize all files, or you want to use a file filter to include or exclude a specific set of files",
    defaultValue: "All files",
  },
  // {
  //   name: "File filter",
  //   type: "switch",
  //   label: "File filter",

  //   description:
  //     "File-name pattern that controls which files will be included or excluded. This option allows wildcards such as '.txt', 'document?.doc'. The option also allows for multiple filters by using coma as a separator, .txt,*.pdf,document?",
  //   defaultValue: false,
  // },
  {
    name: "localFolder",
    type: "text",
    label: "Local folder",

    description: "Name of the local folder to be synchronized",
    defaultValue: "",
  },
  {
    name: "FTPDirectory",
    type: "select",
    label: "FTP directory",
    selectOptions: [],

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
  {
    name: "ftpFilesAdded",
    type: "switch",
    label: "FtpFilesDeleted",

    description:
      "List of FTP files that initially existed in the target directory and after the synchronization process were deleted.",
    defaultValue: true,
  },
  {
    name: "ftpFilesModified",
    type: "switch",
    label: "FtpFilesModified",

    description:
      "List of FTP files that initially existed in both the source and the target and after the synchronization process were added to the target.",
    defaultValue: true,
  },
  {
    name: "ftpFilesDeleted",
    type: "switch",
    label: "FtpFilesDeleted",

    description:
      "List of FTP files that initially existed in the target directory and after the synchronization process were deleted.",
    defaultValue: true,
  },
];

const synchronizeDirectoriesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["FTPConnection"],
      ["synchronizationDirection"],
      ["fileToSync"],
      ["localFolder"],
      ["FTPDirectory"],
      ["deleteIfSourceIsAbsent"],
      ["includeSubdirectories"],
      ["timeDiffrenceInHours"],
      ["timeDifferenceInMinutes"],
      ["timeDifferencAhead"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["ftpFilesAdded"],
      ["ftpFilesModified"],
      ["ftpFilesDeleted"],
    ],
  },
];

const synchronizeDirectories: ActivityConfig = {
  fieldList: synchronizeDirectoriesFieldList,
  fieldCategories: synchronizeDirectoriesFieldCategories,
  fieldsToWatch: [],
};

export default synchronizeDirectories;
