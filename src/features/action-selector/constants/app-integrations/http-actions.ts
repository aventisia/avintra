import { NodeDataType } from "@/types/node-data-type";

export const httpActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "downloadFromWeb",
    label: "Download from web",
    description: "Downloads text or a file from the web and stores it",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "invokeSoapWebService",
    label: "Invoke SOAP web service",
    description: "Invokes a method from a SOAP web service",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "invokeWebService",
    label: "Invoke web service",
    description: "Invokes a web service and stores the response text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
