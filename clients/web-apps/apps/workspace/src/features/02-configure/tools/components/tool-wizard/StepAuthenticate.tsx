import { crudDialogFieldClasses } from "@avplatform/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { useId } from "react";

import { FormField } from "@/components/card-dialog/FormField";

import { ToolAuthenticationTypeEnum } from "../../enums/tool-authentication-type-enum";
import { useFetchCustomApiCredentials } from "../../hooks/useFetchCustomApiCredentials.hook";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import { FieldHint } from "./FieldHint";

const NO_CREDENTIAL = "__no-credential__";

const authOptions = [
  { label: "No authentication", value: ToolAuthenticationTypeEnum.None },
  { label: "API key (header)", value: ToolAuthenticationTypeEnum.ApiKeyHeader },
  { label: "API key (query)", value: ToolAuthenticationTypeEnum.ApiKeyQuery },
  { label: "Bearer token", value: ToolAuthenticationTypeEnum.Bearer },
  { label: "Basic authentication", value: ToolAuthenticationTypeEnum.Basic },
];

/**
 * Authentication step: how the tool signs requests and which vault credential it uses.
 */
export const StepAuthenticate = () => {
  const fieldId = useId();
  const authTypeId = `${fieldId}-auth-type`;
  const credentialId = `${fieldId}-credential`;
  const { draftTool, setDraftTool } = useToolWizardStore();
  const { data: customApiCredentials, isLoading: isCredentialsLoading } =
    useFetchCustomApiCredentials();

  if (!draftTool) {
    return (
      <p className="text-[13px] text-muted-foreground">No tool draft loaded. Go back to step 1.</p>
    );
  }

  const handleAuthChange = (value: string) => {
    setDraftTool({
      ...draftTool,
      authenticationType: value as ToolAuthenticationTypeEnum,
    });
  };

  const handleCredentialChange = (value: string) => {
    setDraftTool({
      ...draftTool,
      credentialName: value,
    });
  };

  return (
    <div className="space-y-4">
      <FormField
        htmlFor={authTypeId}
        label="Authentication type"
        hint={<FieldHint>How the tool signs its requests to the API.</FieldHint>}
      >
        <Select
          value={draftTool.authenticationType ?? ToolAuthenticationTypeEnum.None}
          onValueChange={handleAuthChange}
        >
          <SelectTrigger id={authTypeId} className={crudDialogFieldClasses.selectTrigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {authOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormField
        htmlFor={credentialId}
        label="Credential"
        isOptional
        hint={
          <FieldHint>
            Custom API tool credentials are managed in <strong>Configure › Vaults</strong>.
          </FieldHint>
        }
      >
        <Select
          value={draftTool.credentialName || NO_CREDENTIAL}
          onValueChange={(value) => handleCredentialChange(value === NO_CREDENTIAL ? "" : value)}
          disabled={isCredentialsLoading}
        >
          <SelectTrigger id={credentialId} className={crudDialogFieldClasses.selectTrigger}>
            <SelectValue placeholder="Select a credential" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CREDENTIAL}>No credential</SelectItem>
            {(customApiCredentials ?? []).map((cred) => (
              <SelectItem key={cred.value} value={cred.value}>
                {cred.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
};
