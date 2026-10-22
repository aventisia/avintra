import { uuidv4Regex } from "@avplatform/ui/utils";
import { useEffect } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

type NodeConfigValidator = (form: UseFormReturn<FieldValues>) => void;

const CREATE_JOB_FIELDS = [
  "TargetFlowVersionId",
  "Machine",
  "JobInputData",
  "ExistingJobId",
  "PollIntervalSeconds",
  "TimeoutSeconds",
];

const isValidJson = (value: string) => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

const validateCreateJobNode: NodeConfigValidator = (form) => {
  const values = form.getValues();
  const targetFlowVersionId = String(values.TargetFlowVersionId ?? "").trim();
  const machine = String(values.Machine ?? "").trim();
  const jobInputData = String(values.JobInputData ?? "").trim();
  const existingJobId = String(values.ExistingJobId ?? "").trim();
  const waitForCompletion = Boolean(values.WaitForCompletion);
  const pollIntervalSeconds = Number(values.PollIntervalSeconds);
  const timeoutSeconds = Number(values.TimeoutSeconds);

  form.clearErrors(CREATE_JOB_FIELDS);

  if (!targetFlowVersionId)
    form.setError("TargetFlowVersionId", {
      type: "validate",
      message: "Agent is required",
    });

  if (!values.ExecuteOnCloud && !machine)
    form.setError("Machine", {
      type: "validate",
      message: "Machine is required when cloud execution is off",
    });

  if (jobInputData && !isValidJson(jobInputData))
    form.setError("JobInputData", {
      type: "validate",
      message: "Job Input Data must be a valid JSON",
    });

  if (existingJobId && !uuidv4Regex.test(existingJobId))
    form.setError("ExistingJobId", {
      type: "validate",
      message: "Existing Job ID must be a valid UUID",
    });

  if (waitForCompletion && (!Number.isInteger(pollIntervalSeconds) || pollIntervalSeconds < 1))
    form.setError("PollIntervalSeconds", {
      type: "validate",
      message: "Poll Interval must be a positive integer number of seconds",
    });
  else if (
    waitForCompletion &&
    Number.isInteger(timeoutSeconds) &&
    pollIntervalSeconds >= timeoutSeconds
  )
    form.setError("PollIntervalSeconds", {
      type: "validate",
      message: "Poll Interval must be less than the Timeout",
    });

  if (waitForCompletion && (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 1))
    form.setError("TimeoutSeconds", {
      type: "validate",
      message: "Timeout must be a positive integer number of seconds",
    });
};

const nodeConfigValidators: Record<string, NodeConfigValidator> = {
  CreateJobNode: validateCreateJobNode,
};

/**
 * Applies the node-specific cross-field validation rules to the config form.
 */
export const useNodeConfigValidation = (
  form: UseFormReturn<FieldValues>,
  nodeUniqueName: string,
) => {
  useEffect(() => {
    const validate = nodeConfigValidators[nodeUniqueName];
    if (!validate) return;

    const run = () => {
      if (form.formState.isDirty) validate(form);
    };

    const subscription = form.watch(run);
    return () => subscription.unsubscribe();
  }, [form, nodeUniqueName]);
};
