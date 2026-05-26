import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { VectorStoreEnum } from "../enums/vector-store-enum";

//  Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Id",
  disabled: true,
};

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Name",
  isRequired: true,
  description: "A unique name for your knowledge base.",
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  className: "min-h-[6rem]",
};

// Vector Store
const vectorStoreProps: SelectFieldProps = {
  name: "vectorStore",
  label: "Vector Store",
  description: "Select the vector database used for storing embeddings.",
  isRequired: true,
  selectOptions: enumToArray(VectorStoreEnum),
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
  isDisabledProps,
};
