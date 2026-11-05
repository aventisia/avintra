import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";

import { ToolAuthenticationTypeEnum } from "../../enums/tool-authentication-type-enum";
import { useFetchCustomApiCredentials } from "../../hooks/useFetchCustomApiCredentials.hook";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import { FieldLabel } from "./FieldLabel";

const authOptions = [
  { label: "No authentication", value: ToolAuthenticationTypeEnum.None },
  { label: "API Key (Header)", value: ToolAuthenticationTypeEnum.ApiKeyHeader },
  { label: "API Key (Query)", value: ToolAuthenticationTypeEnum.ApiKeyQuery },
  { label: "Bearer Token", value: ToolAuthenticationTypeEnum.Bearer },
  { label: "Basic Authentication", value: ToolAuthenticationTypeEnum.Basic },
];

const NO_CREDENTIAL_VALUE = "__none__";

export const StepAuthenticate = () => {
  const { draftTool, setDraftTool } = useToolWizardStore();
  const { data: customApiCredentials, isLoading: isCredentialsLoading } =
    useFetchCustomApiCredentials();

  if (!draftTool) {
    return (
      <p className="text-sm text-muted-foreground">No tool draft loaded. Go back to Step 1.</p>
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
      <div className="space-y-1.5">
        <FieldLabel
          label="Authentication Type"
          description="How the tool authenticates with the external API. Choose the method that matches the API."
        />
        <select
          value={draftTool.authenticationType ?? ToolAuthenticationTypeEnum.None}
          onChange={(e) => handleAuthChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {authOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <FieldLabel
          label="Credential"
          description="Select a Custom API Tool credential to use for authentication, if required."
        />
        <Select
          value={draftTool.credentialName || NO_CREDENTIAL_VALUE}
          onValueChange={(value) =>
            handleCredentialChange(value === NO_CREDENTIAL_VALUE ? "" : value)
          }
          disabled={isCredentialsLoading}
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select a Custom API Tool credential..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_CREDENTIAL_VALUE}>No credential</SelectItem>
            {(customApiCredentials ?? []).map((cred) => (
              <SelectItem key={cred.value} value={cred.value}>
                <span className="flex items-center gap-2">
                  <img src={cred.icon} alt="" className="size-4 shrink-0" />
                  {cred.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          To add a credential, go to <strong>Configure → Vaults</strong>.
        </p>
      </div>
    </div>
  );
};
