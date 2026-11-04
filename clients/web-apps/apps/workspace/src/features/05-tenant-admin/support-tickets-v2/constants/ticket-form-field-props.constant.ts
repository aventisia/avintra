import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@avplatform/ui/form";

export const requestTypeProps: SelectFieldProps = {
  name: "requestType",
  label: "Request type",
  isRequired: true,
  selectOptions: [
    { value: "ServiceRequest", label: "Service request" },
    { value: "ChangeRequest", label: "Change request" },
  ],
};

export const titleProps: InputFieldProps = {
  name: "title",
  label: "Title",
  isRequired: true,
  placeholder: "e.g. Add a weekly sales report",
};

export const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  isRequired: true,
  placeholder: "Describe what you need, in at least 20 characters",
  className: "min-h-[6rem]",
};

export const requiredByProps: InputFieldProps = {
  name: "requiredBy",
  label: "Required by",
  type: "date",
  // Disable selection of dates before today (the current date).
  min: new Date().toISOString().slice(0, 10),
};

export const agentRefIdProps: SelectFieldProps = {
  name: "agentRefId",
  label: "Agent",
  isRequired: true,
  selectOptions: [],
};

export const changeSummaryProps: TextareaFieldProps = {
  name: "changeSummary",
  label: "Change summary",
  placeholder: "What should change?",
  className: "min-h-[4rem]",
};

export const changeReasonProps: TextareaFieldProps = {
  name: "changeReason",
  label: "Change reason",
  placeholder: "Why is the change needed?",
  className: "min-h-[4rem]",
};

export const expectedBehaviorProps: TextareaFieldProps = {
  name: "expectedBehavior",
  label: "Expected behavior",
  placeholder: "How should the agent behave afterwards?",
  className: "min-h-[4rem]",
};

export const requestedTimelineProps: InputFieldProps = {
  name: "requestedTimeline",
  label: "Requested timeline",
  type: "date",
  // Disable selection of dates before today (the current date).
  min: new Date().toISOString().slice(0, 10),
};

export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable ticket",
  description: "Turn on when it's no longer relevant.",
};
