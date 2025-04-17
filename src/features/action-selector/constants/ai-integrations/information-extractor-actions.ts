import { NodeDataType } from "@/types/node-data-type";

export const informationExtractorActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "informationExtractor",
    label: "Information Extractor",
    description: "Extract information out of a pdf file",
    img: `${import.meta.env.BASE_URL}function.png`,
    formType: "custom"
  },
];
