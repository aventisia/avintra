import { ToolAuthenticationTypeEnum } from "../../enums/tool-authentication-type-enum";
import { useFetchCustomApiCredentials } from "../../hooks/useFetchCustomApiCredentials.hook";
import { useToolWizardStore } from "../../stores/tool-wizard.store";

const authOptions = [
  { label: "No authentication", value: ToolAuthenticationTypeEnum.None },
  { label: "API Key (Header)", value: ToolAuthenticationTypeEnum.ApiKeyHeader },
  { label: "API Key (Query)", value: ToolAuthenticationTypeEnum.ApiKeyQuery },
  { label: "Bearer Token", value: ToolAuthenticationTypeEnum.Bearer },
  { label: "Basic Authentication", value: ToolAuthenticationTypeEnum.Basic },
];

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
        <label className="text-sm font-medium">Authentication Type</label>
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
        <label className="text-sm font-medium">Credential</label>
        <select
          value={draftTool.credentialName ?? ""}
          onChange={(e) => handleCredentialChange(e.target.value)}
          disabled={isCredentialsLoading}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select a Custom API Tool credential...</option>
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
