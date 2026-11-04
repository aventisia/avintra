import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { VectorStoreEnum } from "../enums/vector-store-enum";

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Unique name",
  placeholder: "e.g. product_manuals",
  isRequired: true,
  description:
    "A **unique** name for your knowledge base.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** letters (a-z, A-Z), numbers (0-9) and underscore (`_`). Must start with a letter or underscore. No spaces or other special characters.\n- **Cannot be changed** after creation.",
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  description: "A short summary of what the knowledge base contains.",
  placeholder: "What does this knowledge base contain?",
  className: "min-h-[6rem]",
};

// Vector Store
const vectorStoreProps: SelectFieldProps = {
  name: "vectorStore",
  label: "Vector store",
  description: "Select the vector database used for storing embeddings.",
  isRequired: true,
  selectOptions: enumToArray(VectorStoreEnum),
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable record",
  description: "Disable this record if it's been outdated, or not required anymore",
};
export { nameProps, descriptionProps, vectorStoreProps, isDisabledProps };
