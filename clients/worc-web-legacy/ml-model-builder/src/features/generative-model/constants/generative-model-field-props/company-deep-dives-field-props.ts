import { SelectFieldProps } from "@/shared/select-field/SelectField";

import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { FocusAreasEnum } from "../../enums/company-deep-dive/focus-areas-enum";
import { SummaryDepthEnum } from "../../enums/company-deep-dive/summary-depth-enum";
import { WebDataEnum } from "../../enums/company-deep-dive/web-data-enum";

const companyNameProps: AutosizeTextareaFieldProps = {
  name: "generativeModel.setupObject.companyName",
  label: "Company Name",
  minHeight: 10,
  isRequired: true,
  className: "text-sm resize-none",
};

const websiteLinkProps: AutosizeTextareaFieldProps = {
  name: "generativeModel.setupObject.websiteLink",
  label: "Website Link",
  minHeight: 10,
  isRequired: true,
  className: "text-sm resize-none",
};

const focusAreaProps: SelectFieldProps = {
  name: "generativeModel.setupObject.focusArea",
  label: "Focus Area",
  selectOptions: enumToArray(FocusAreasEnum),
  placeholder: "Select",
  isRequired: true,
  className: "text-sm resize-none",
};

const webDataProps: SelectFieldProps = {
  name: "generativeModel.setupObject.webData",
  label: "Web Data",
  selectOptions: enumToArray(WebDataEnum),
  placeholder: "Select",
  isRequired: true,
  className: "text-sm resize-none",
};

const summaryDepthProps: SelectFieldProps = {
  name: "generativeModel.setupObject.summaryDepth",
  label: "Summary Depth",
  selectOptions: enumToArray(SummaryDepthEnum),
  placeholder: "Select",
  isRequired: true,
  className: "text-sm resize-none",
};

export {
  companyNameProps,
  websiteLinkProps,
  focusAreaProps,
  webDataProps,
  summaryDepthProps,
};
