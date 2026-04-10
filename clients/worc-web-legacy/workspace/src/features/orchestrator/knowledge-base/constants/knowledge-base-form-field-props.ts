import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { EmbeddingModelEnum } from "../enums/embedding-models-enum";
import { VectorStoreEnum } from "../enums/vector-store-enum";

//  Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Id",
  disabled: true,
};

// Name
const nameProps: InputFieldProps = {
  name: "name",
  label: "Name (Cannot be edited after creation)",
  isRequired: true,
  description: "A unique name for your knowledge base.",
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  className: "min-h-[6rem]",
   isRequired: true,
 
};

// Vector Store
const vectorStoreProps: SelectFieldProps = {
  name: "vectorStore",
  label: "Vector Store",
  description: "Select the vector database used for storing embeddings.",
  isRequired: true,
  selectOptions: enumToArray(VectorStoreEnum),
};

// Embedding Model
const embeddingModelProps: SelectFieldProps = {
  name: "embeddingModel",
  label: "Embedding Model",
  description: "Model used to generate embeddings for semantic search.",
  isRequired: true,
  selectOptions: enumToArray(EmbeddingModelEnum),
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};
export {
  idProps,
  nameProps,
  descriptionProps,
  vectorStoreProps,
  embeddingModelProps,
  isDisabledProps,
};
