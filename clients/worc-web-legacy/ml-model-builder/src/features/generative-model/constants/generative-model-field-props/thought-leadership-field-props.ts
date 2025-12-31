import { SelectFieldProps } from "@/shared/select-field/SelectField";

import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { DataAndStatsEnum } from "../../enums/thought-leadership/data-and-stats-enum";
import { DocumentTypeEnum } from "../../enums/thought-leadership/document-type-enum";
import { PurposeOfArticleEnum } from "../../enums/thought-leadership/purpose-of-article-enum";
import { ToneAndStyleEnum } from "../../enums/thought-leadership/tone-and-style-enum";

const documentTypeProps: SelectFieldProps = {
  name: "generativeModel.setupObject.documentType",
  label: "Document Type",
  selectOptions: enumToArray(DocumentTypeEnum),
  placeholder: "Select",
  isRequired: true,
  className: "text-sm resize-none",
};

const topicProps: AutosizeTextareaFieldProps = {
  name: "generativeModel.setupObject.topic",
  label: "Topic",
  minHeight: 10,
  isRequired: true,
  className: "text-sm resize-none",
};

const industryProps: AutosizeTextareaFieldProps = {
  name: "generativeModel.setupObject.industry",
  label: "Industry / Domain",
  minHeight: 10,
  isRequired: true,
  className: "text-sm resize-none",
};

const purposeOfArticleProps: SelectFieldProps = {
  name: "generativeModel.setupObject.purpose",
  label: "Purpose of Article",
  selectOptions: enumToArray(PurposeOfArticleEnum),
  placeholder: "Select",
  isRequired: true,
  className: "text-sm resize-none",
};

const toneAndStyleProps: SelectFieldProps = {
  name: "generativeModel.setupObject.toneStyle",
  label: "Tone and Style",
  selectOptions: enumToArray(ToneAndStyleEnum),
  placeholder: "Select",
  isRequired: true,
  className: "text-sm resize-none",
};

const targetAudienceProps: AutosizeTextareaFieldProps = {
  name: "generativeModel.setupObject.audienceTarget",
  label: "Target Audience",
  minHeight: 10,
  isRequired: true,
  className: "text-sm resize-none",
};

const dataAndStatsProps: SelectFieldProps = {
  name: "generativeModel.setupObject.dataAndStats",
  label: "Data and Stats",
  selectOptions: enumToArray(DataAndStatsEnum),
  placeholder: "Select",
  isRequired: true,
  className: "text-sm resize-none",
};

const outputLengthProps: AutosizeTextareaFieldProps = {
  name: "generativeModel.setupObject.contentLength",
  label: "Output Length (in words)",
  minHeight: 10,
  isRequired: true,
  className: "text-sm resize-none",
};

const outputStructureProps: AutosizeTextareaFieldProps = {
  name: "generativeModel.setupObject.contentStructure",
  label: "Output Structure / Outline",
  minHeight: 10,
  isRequired: true,
  className: "text-sm resize-none",
};

export {
  documentTypeProps,
  topicProps,
  industryProps,
  purposeOfArticleProps,
  toneAndStyleProps,
  targetAudienceProps,
  dataAndStatsProps,
  outputStructureProps,
  outputLengthProps,
};
