import { DatePickerFieldProps } from "@/react-toolkit/ui/form/fields/DatePickerField";
import { InputFieldProps } from "@/react-toolkit/ui/form/fields/InputField";

// New Allocated Units
export const additionalUnitsRequestedProps: InputFieldProps = {
  name: "additionalUnitsRequested",
  label: "New Allocated Units",
  isRequired: true,
  placeholder: "8",
};

export const dateReceivedProps: DatePickerFieldProps = {
  name: "dateReceived",
  label: "Date Received",
  isRequired: true,
};

export const amountReceivedProps: InputFieldProps = {
  name: "amountReceived",
  label: "Amount Received",
  isRequired: true,
  placeholder: "9999.99",
};
