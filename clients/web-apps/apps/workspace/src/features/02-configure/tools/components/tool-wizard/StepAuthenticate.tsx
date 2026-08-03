import { Button } from "@avplatform/ui/buttons";
import { SelectField } from "@avplatform/ui/form";

import { ToolAuthenticationTypeEnum } from "../../enums/tool-authentication-type-enum";

/**
 * Step 2 — Select authentication type and credential.
 */
export const StepAuthenticate = () => {
  return (
    <div className="space-y-4">
      <SelectField
        name="authenticationType"
        label="Authentication Type"
        selectOptions={[
          { label: "No authentication", value: ToolAuthenticationTypeEnum.None },
          { label: "API Key (Header)", value: ToolAuthenticationTypeEnum.ApiKeyHeader },
          { label: "API Key (Query)", value: ToolAuthenticationTypeEnum.ApiKeyQuery },
          { label: "Bearer Token", value: ToolAuthenticationTypeEnum.Bearer },
          { label: "Basic Authentication", value: ToolAuthenticationTypeEnum.Basic },
        ]}
      />

      <SelectField
        name="credentialId"
        label="Credential"
        selectOptions={[]}
        placeholder="Select an AppSecret credential..."
      />

      <Button variant="outline" className="w-full">
        Create new credential
      </Button>
    </div>
  );
};
