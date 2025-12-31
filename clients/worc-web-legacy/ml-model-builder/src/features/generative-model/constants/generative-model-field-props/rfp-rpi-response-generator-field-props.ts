import { SelectFieldProps } from "@/shared/select-field/SelectField";

import { AutosizeTextareaFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { ResponseBoundariesEnum } from "../../enums/rfp-rpi-response-strategy/response-boundaries-enum";
import { ResponseStrategyEnum } from "../../enums/rfp-rpi-response-strategy/response-strategy-enum";

const clientNameProps: AutosizeTextareaFieldProps = {
  name: "generativeModel.setupObject.clientName",
  label: "Client / Bidder Name",
  minHeight: 10,
  isRequired: true,
  className: "text-sm resize-none",
};

const clientLinkProps: AutosizeTextareaFieldProps = {
  name: "generativeModel.setupObject.websiteLink",
  label: "Client / Bidder Website Link",
  minHeight: 10,
  isRequired: true,
  className: "text-sm resize-none",
};

const responseStrategyProps: SelectFieldProps = {
  name: "generativeModel.setupObject.responseStrategy",
  label: "Response Strategy",
  selectOptions: enumToArray(ResponseStrategyEnum),
  placeholder: "Select",
  isRequired: true,
  className: "text-sm resize-none",
};

const responseBoundariesProps: SelectFieldProps = {
  name: "generativeModel.setupObject.responseBoundary",
  label: "Response Boundaries",
  selectOptions: enumToArray(ResponseBoundariesEnum),
  placeholder: "Select",
  isRequired: true,
  className: "text-sm resize-none",
};

export {
  clientNameProps,
  clientLinkProps,
  responseStrategyProps,
  responseBoundariesProps,
};
