import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

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
  label: "Unique Name",
  isRequired: true,
  description:
    "A **unique** name for your knowledge base.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9) and underscore (`_`). Must start with a letter or underscore. No spaces or other special characters.\n- **Can be changed** after creation.",
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
  description: "Disable this record if it's been outdated, or not required anymore",
};
export { idProps, nameProps, descriptionProps, vectorStoreProps, isDisabledProps };
