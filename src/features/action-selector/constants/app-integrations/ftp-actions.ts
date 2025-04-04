import { NodeDataType } from "@/types/node-data-type";

export const ftpActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "openFtpConnection",
    label: "Open FTP connection",
    description:
      "This action establishes a specific connection to a remote FTP server, and stores that connection as a variable for later use",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "listFtpDirectory",
    label: "List FTP directory",
    description:
      "This action returns the subdirectories and files contained in the current directory of an FTP connection",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  // TO DO - To be implmented later
  // Reason for hiding - it required both AND, OR conditions in conjuction on a single field.
  // {
  //   type: "activityNode",
  //   name: "openSecureFtpConnection",
  //   label: "Open secure FTP connection",
  //   description:
  //     "This action establishes a specific secure connection to a remote FTP server, and stores that connection as a variable for later use",
  //   img: `${import.meta.env.BASE_URL}function.png`,
  // },
  {
    type: "activityNode",
    name: "closeConnection",
    label: "Close connection",
    description: "This action closes an open FTP connection",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "changeWorkingDirectory",
    label: "Change working directory",
    description:
      "This action sets the current working directory for an FTP connection",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "downloadFilesFromFtp",
    label: "Download file(s) from FTP",
    description: "Downloads one or more files from an FTP server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "downloadFoldersFromFtp",
    label: "Download folder(s) from FTP",
    description: "Downloads one or more folders from an FTP server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "uploadFilesToFtp",
    label: "Upload File(s) to FTP",
    description: "Uploads one or more files to an FTP server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "uploadFoldersToFtp",
    label: "Upload folder(s) to FTP",
    description: "Uploads one or more folders to an FTP server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteFtpFile",
    label: "Delete FTP file",
    description: "Deletes one or more files from an FTP server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "renameFtpFile",
    label: "Rename FTP File",
    description: "Renames a file that resides on an FTP server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "createFtpDirectory",
    label: "Create FTP directory",
    description: "Creates a directory on an FTP server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "deleteFtpDirectory",
    label: "Delete FTP directory",
    description: "Deletes a directory from an FTP server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "invokeFtpCommand",
    label: "Invoke FTP command",
    description: "Invokes the given literal FTP command on the server",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "synchronizeDirectories",
    label: "Synchronize directories",
    description:
      "Synchronize the files and subdirectories of a given Folder with a given remote FTP directory",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
