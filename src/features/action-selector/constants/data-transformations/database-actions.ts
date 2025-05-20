import { NodeDataType } from "@/types/node-data-type";

export const databaseActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "openSQLConnection",
    label: "Open SQL connection",
    description: "Open a new  connection to a database",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "executeSQLStatement",
    label: "Execute SQL statement",
    description: "Connect to a database and execute an SQL statement",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "closeSQLConnection",
    label: "Close SQL connection",
    description: "Close an open connection to a database",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
