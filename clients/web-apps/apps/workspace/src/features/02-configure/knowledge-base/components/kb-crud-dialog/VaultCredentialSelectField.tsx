import { SelectField, type SelectFieldProps } from "@avplatform/ui/form";
import { useEffect, useState } from "react";

import { getVaultCredentialSelectOptions } from "../../apis/vault-credential-select.apis.ts";
import { VaultCredentialSelectDto } from "../../dtos/vault-credential-select.dto";

type VaultCredentialSelectFieldProps = Omit<SelectFieldProps, "selectOptions"> & {
  modelProvider?: string;
};

/**
 * Select field listing the vault credentials of one provider.
 */
const VaultCredentialSelectField = ({
  name,
  modelProvider,
  placeholder,
  ...props
}: VaultCredentialSelectFieldProps) => {
  const [selectOptions, setSelectOptions] = useState<VaultCredentialSelectDto[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    getVaultCredentialSelectOptions(modelProvider ?? name.replace("__CredentialName__", ""))
      .then((data) => {
        setSelectOptions(data?.data ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch models", err);
        setLoading(false);
      });
  }, [modelProvider, name]);

  const emptyPlaceholder = isLoading ? "Fetching credentials..." : "No credentials found";

  return (
    <SelectField
      {...props}
      name={name}
      selectOptions={selectOptions}
      placeholder={
        selectOptions.length > 0 ? (placeholder ?? "Select credential") : emptyPlaceholder
      }
    />
  );
};

VaultCredentialSelectField.displayName = "VaultCredentialSelectField";

export { VaultCredentialSelectField, type VaultCredentialSelectFieldProps };
