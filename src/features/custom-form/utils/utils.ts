import { FC } from "react";
import informationExtractor from "../information-extractor/components/InformationExtractorForm";
import setVariable from "../set-variable/components/SetVariableForm";
import { CustomFormComponentProps } from "../types/custom-form-component-props"; // wherever you define it

export const customActionMapper: Record<string, FC<CustomFormComponentProps>> = {
  informationExtractor,
  setVariable,
};
