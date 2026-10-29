import { ToolAuthenticationTypeEnum } from "../../enums/tool-authentication-type-enum";
import { useFetchCustomApiCredentials } from "../../hooks/useFetchCustomApiCredentials.hook";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import { FieldLabel } from "./FieldLabel";

const authOptions = [
  { label: "No authentication", value: ToolAuthenticationTypeEnum.None },
  { label: "API key (header)", value: ToolAuthenticationTypeEnum.ApiKeyHeader },
  { label: "API key (query)", value: ToolAuthenticationTypeEnum.ApiKeyQuery },
  { label: "Bearer token", value: ToolAuthenticationTypeEnum.Bearer },
  { label: "Basic authentication", value: ToolAuthenticationTypeEnum.Basic },
];

export const StepAuthenticate = () => {
  const { draftTool, setDraftTool } = useToolWizardStore();
  const { data: customApiCredentials, isLoading: isCredentialsLoading } =
    useFetchCustomApiCredentials();

  if (!draftTool) {
    return (
      <p className="text-sm text-muted-foreground">No tool draft loaded. Go back to step 1.</p>
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
          label="Authentication type"
          description="How the tool authenticates with the external API. Choose the method that matches the API."
        />
        <select
          value={draftTool.authenticationType ?? ToolAuthenticationTypeEnum.None}
          onChange={(e) => handleAuthChange(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          description="Select a custom API tool credential to use for authentication, if required."
        />
        <select
          value={draftTool.credentialName ?? ""}
          onChange={(e) => handleCredentialChange(e.target.value)}
          disabled={isCredentialsLoading}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select a custom API tool credential...</option>
          {(customApiCredentials ?? []).map((cred) => (
            <option key={cred.value} value={cred.value}>
              {cred.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          To add a credential, go to <strong>Configure → Vaults</strong>.
        </p>
      </div>
    </div>
  );
};
