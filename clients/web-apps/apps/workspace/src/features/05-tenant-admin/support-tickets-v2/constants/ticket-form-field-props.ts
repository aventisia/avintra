import {
  InputFieldProps,
  SelectFieldProps,
  SwitchFieldProps,
  TextareaFieldProps,
} from "@avplatform/ui/form";

export const idProps: InputFieldProps = {
  name: "id",
  label: "Ticket ID",
  disabled: true,
};

export const requestTypeProps: SelectFieldProps = {
  name: "requestType",
  label: "Request Type",
  isRequired: true,
  selectOptions: [
    { value: "ServiceRequest", label: "Service Request" },
    { value: "ChangeRequest", label: "Change Request" },
  ],
};

export const titleProps: InputFieldProps = {
  name: "title",
  label: "Title",
  isRequired: true,
  placeholder: "Brief summary of the request",
};

export const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  isRequired: true,
  placeholder: "Detailed description (min 20 characters)",
  className: "min-h-[6rem]",
};

export const requiredByProps: InputFieldProps = {
  name: "requiredBy",
  label: "Required By",
  type: "date",
};

export const agentRefIdProps: SelectFieldProps = {
  name: "agentRefId",
  label: "Agent",
  isRequired: true,
  selectOptions: [],
};

export const changeSummaryProps: TextareaFieldProps = {
  name: "changeSummary",
  label: "Change Summary",
  placeholder: "Summary of the change (max 500 chars)",
  className: "min-h-[4rem]",
};

export const changeReasonProps: TextareaFieldProps = {
  name: "changeReason",
  label: "Change Reason",
  placeholder: "Reason for the change (max 500 chars)",
  className: "min-h-[4rem]",
};

export const expectedBehaviorProps: TextareaFieldProps = {
  name: "expectedBehavior",
  label: "Expected Behavior",
  placeholder: "Expected behavior after change (max 500 chars)",
  className: "min-h-[4rem]",
};

export const requestedTimelineProps: InputFieldProps = {
  name: "requestedTimeline",
  label: "Requested Timeline",
  type: "date",
};

export const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description: "Disable this ticket if it's no longer relevant",
};
