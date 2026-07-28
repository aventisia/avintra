import { InputFieldProps } from "@avplatform/ui/form";

// Run Delay
const runDelayProps: InputFieldProps = {
  fieldSize: "sm",
  type:"number",
  name: "runDelay",
  label: "Run Delay",
  description:
    "The time interval to wait between actions, when the flow runs in debugging mode within the designer. The acceptable values range from 1 ms to 10000 ms.",
};
export { runDelayProps };
