import { NodeDataType } from "@/types/node-data-type";

export const compressionActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "zipFiles",
    label: "Zip files",
    description: "Compress one or more files or folders into a zip archive",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "unzipFiles",
    label: "Unzip files",
    description:
      "Uncompress one or more files or folders contained in a zip archive",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
