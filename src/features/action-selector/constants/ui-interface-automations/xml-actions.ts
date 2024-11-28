import { NodeDataType } from "@/types/node-data-type";

export const xmlActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "readXmlFromFile",
    label: "Read XML from file",
    description: "Read the contents of an XML file into a variable",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "writeXmlToFile",
    label: "Write XML to file",
    description: "Write the contents of an XML node variable into a file",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "executeXpathExpression",
    label: "Execute XPath expression",
    description:
      "Extract values from an XML document based on the provided XPath query",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getXmlElementAttribute",
    label: "Get XML element attribute",
    description: "Get the value of an attribute of an XML element",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setXmlElementAttribute",
    label: "Set XML element attribute",
    description: "Set the value of an attribute of an XML element",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "removeXmlElementAttribute",
    label: "Remove XML element attribute",
    description: "Remove an attribute from an XML element",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getXmlElementValue",
    label: "Get XML element value",
    description: "Get the value of an XML element",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setXmlElementValue",
    label: "Set XML element value",
    description: "Set the value of an XML element",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "insertXmlElement",
    label: "Insert XML element",
    description: "Insert a new XML element into an XML document",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "removeXmlElement",
    label: "Remove XML element",
    description: "Remove one or more XML elements from an XML document",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
