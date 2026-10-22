import { BaseFieldProps, SwitchField } from "@avplatform/ui/form";
import { useEffect } from "react";
import { FieldPath, FieldValues, useFormContext, useWatch } from "react-hook-form";

import { useSelectedFlowVersion } from "../../hooks/useSelectedFlowVersion.hook";

interface CloudExecutionSwitchFieldProps extends BaseFieldProps {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;

  /** If true, the field is disabled and cannot be interacted with. */
  disabled?: boolean;
}

const FLOW_VERSION_FIELD = "TargetFlowVersionId";

const CLOUD_LOCATION = "cloud";

const CLOUD_UNSUPPORTED_DESCRIPTION =
  "Cloud execution is not supported for this agent. Select a machine instead.";

const isCloudSupported = (supportedPlatform?: string) => {
  if (!supportedPlatform) return false;

  return supportedPlatform
    .split(",")
    .some((platform) => platform.trim().toLowerCase() === CLOUD_LOCATION);
};

const CloudExecutionSwitchField = ({
  name,
  label,
  description,
  disabled,
}: CloudExecutionSwitchFieldProps) => {
  const { control, setValue } = useFormContext<FieldValues>();
  const flowVersionId = useWatch({ control, name: FLOW_VERSION_FIELD }) as string | undefined;
  const selectedFlowVersion = useSelectedFlowVersion(flowVersionId);
  const value = useWatch({ control, name }) as boolean | undefined;

  const supportsCloud = isCloudSupported(selectedFlowVersion?.supportedPlatform);
  const isUnsupported = Boolean(flowVersionId) && !supportsCloud;

  useEffect(() => {
    if (!supportsCloud && value) setValue(name, false);
  }, [supportsCloud, value, name, setValue]);

  return (
    <SwitchField
      name={name}
      label={label || ""}
      description={isUnsupported ? CLOUD_UNSUPPORTED_DESCRIPTION : description || ""}
      size="sm"
      disabled={disabled || !supportsCloud}
    />
  );
};

CloudExecutionSwitchField.displayName = "CloudExecutionSwitchField";

export { CloudExecutionSwitchField };
