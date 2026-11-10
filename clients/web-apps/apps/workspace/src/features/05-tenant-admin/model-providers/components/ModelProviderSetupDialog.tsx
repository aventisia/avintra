import { Switch } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { crudDialogFieldClasses } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { toast } from "@avplatform/ui/sonner";
import { Tooltip } from "@avplatform/ui/tooltip";
import { formatCapabilityLabel, toModelCapability } from "@avplatform/ui/utils";
import { CircleNotchIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useMemo, useState } from "react";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { getVaultCredentialSelectOptions } from "@/features/02-configure/queues/queues-table/apis/vault-credential-select.apis";
import { pluralize } from "@/utils/pluralize.util";

import { getLlmModelsV2, upsertModelProvider } from "../apis/model-provider-apis";
import {
  getProviderIcon,
  getVaultCredentialTypeForProvider,
} from "../constants/model-provider-definitions";
import { EnabledModelDto } from "../dtos/enabled-model.dto";
import { LlmModelInfoDto } from "../dtos/llm-provider-v2-dto";
import { TenantModelProviderDto } from "../dtos/model-provider-dto";
import { MODEL_PROVIDERS_QUERY_KEY } from "../hooks/useFetchModelProviders";
import { useModelProviderDialogStore } from "../store/model-provider-dialog-store";
import { getSupportedModalities } from "../utils/supported-modalities.util";

type Step = "credential" | "models";

/**
 * Multi-step dialog for configuring a model provider.
 * Choose a vault credential, then toggle the models you want to enable.
 */
export const ModelProviderSetupDialog = () => {
  const { isOpen, closeDialog, provider, config } = useModelProviderDialogStore();
  const queryClient = useQueryClient();
  const fieldId = useId();
  const credentialFieldId = `${fieldId}-credential`;
  const disabledId = `${fieldId}-disabled`;

  const [step, setStep] = useState<Step>("credential");
  const [credentialOptions, setCredentialOptions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [isCredentialLoading, setIsCredentialLoading] = useState(false);
  const [selectedCredentialName, setSelectedCredentialName] = useState<string>("");
  const [enabledModelIds, setEnabledModelIds] = useState<string[]>([]);
  const [enabledModels, setEnabledModels] = useState<EnabledModelDto[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);

  const [providerModels, setProviderModels] = useState<LlmModelInfoDto[]>([]);
  const [isProvidersLoading, setIsProvidersLoading] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  const resetState = () => {
    setStep("credential");
    setSelectedCredentialName("");
    setEnabledModelIds([]);
    setEnabledModels([]);
    setCredentialOptions([]);
    setIsDisabled(false);
    setProviderModels([]);
    setModelSearch("");
  };

  useEffect(() => {
    if (!isOpen || !provider) return;

    resetState();

    setIsCredentialLoading(true);
    getVaultCredentialSelectOptions(getVaultCredentialTypeForProvider(provider.value))
      .then((res) => {
        const options = res?.data ?? [];
        setCredentialOptions(options);

        if (config) {
          const savedCredential = config.credentialName ?? config.credentialId ?? "";
          setSelectedCredentialName(savedCredential);
          setEnabledModelIds(config.enabledModelIds ?? []);
          setEnabledModels(config.enabledModels ?? []);
          setIsDisabled(Boolean(config.isDisabled));
          setStep("models");
          void loadProviderModels(savedCredential);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch credentials", err);
        toast.error("Failed to load credentials.");
      })
      .finally(() => setIsCredentialLoading(false));
  }, [isOpen, provider, config]);

  const handleClose = () => {
    closeDialog();
    resetState();
  };

  const upsertMutation = useMutation({
    mutationFn: (payload: TenantModelProviderDto) => upsertModelProvider(payload),
    onSuccess: () => {
      toast.success(`${provider?.label ?? "Provider"} configuration saved.`);
      queryClient.invalidateQueries({ queryKey: MODEL_PROVIDERS_QUERY_KEY });
      handleClose();
    },
    onError: () => toast.error("Failed to save provider configuration."),
  });

  // IMPORTANT NOTE: The provider name is sent lowercase; for ollama providers the selected
  // credential id is forwarded so the pipeline echoes it back on each returned model.
  const loadProviderModels = async (credentialName?: string) => {
    if (!provider) return;
    setIsProvidersLoading(true);
    setProviderModels([]);
    setModelSearch("");
    try {
      const modelsRes = await getLlmModelsV2(
        provider.value.toLowerCase(),
        undefined,
        credentialName ?? selectedCredentialName,
      );
      setProviderModels(modelsRes?.models ?? []);
    } catch (err) {
      console.error("Failed to fetch models", err);
      toast.error("Failed to load models.");
    } finally {
      setIsProvidersLoading(false);
    }
  };

  const handleNext = () => {
    if (!selectedCredentialName) return;
    setStep("models");
    void loadProviderModels();
  };

  const handleSave = () => {
    if (!provider) return;

    // IMPORTANT NOTE: When the credential dropdown was not re-selected (e.g. the stored
    // credential is a GUID that does not match any name-based option after a provider was
    // disabled), fall back to the previously saved credential so a disabled provider can be re-enabled.
    const credentialName = selectedCredentialName || config?.credentialName || "";
    const credentialId = config?.credentialId ?? null;

    if (!credentialName && !credentialId) return;

    const sendEnabledModels = config?.enabledModels != null || enabledModels.length > 0;

    upsertMutation.mutate({
      providerType: provider.value,
      credentialName,
      credentialId,
      enabledModelIds,
      enabledModels: sendEnabledModels ? enabledModels : undefined,
      isDisabled,
    });
  };

  const toggleModel = (model: LlmModelInfoDto) => {
    const isEnabled = enabledModelIds.includes(model.id);
    setEnabledModelIds((prev) =>
      isEnabled ? prev.filter((m) => m !== model.id) : [...prev, model.id],
    );
    setEnabledModels((prev) =>
      isEnabled
        ? prev.filter((m) => m.modelId !== model.id)
        : [...prev, { modelId: model.id, capability: toModelCapability(model.capability) }],
    );
  };

  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();
    return providerModels.filter((m) => {
      if (!query) return true;
      const capability = m.capability?.toLowerCase() ?? "";
      const capabilityLabel = formatCapabilityLabel(m.capability)?.toLowerCase() ?? "";
      return (
        m.id.toLowerCase().includes(query) ||
        capability.includes(query) ||
        capabilityLabel.includes(query)
      );
    });
  }, [providerModels, modelSearch]);

  const isSaving = upsertMutation.isPending;
  const enabledCount = enabledModelIds.length;

  const credentialSelect = (
    <FormField htmlFor={credentialFieldId} label="Credential">
      <Select
        value={selectedCredentialName}
        onValueChange={(value) => setSelectedCredentialName(value)}
        disabled={isCredentialLoading}
      >
        <SelectTrigger
          id={credentialFieldId}
          className={cn("w-full", crudDialogFieldClasses.selectTrigger)}
        >
          <SelectValue
            placeholder={
              step === "credential" && isCredentialLoading
                ? "Loading credentials..."
                : "Select credential"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {credentialOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={handleClose}
      isDismissLocked={isSaving}
      isOutsideClickLocked={Boolean(selectedCredentialName)}
      widthClassName="w-[min(38rem,calc(100vw-2rem))]"
      mark={
        <span className="inline-grid size-12 shrink-0 place-items-center rounded-lg bg-sunken ring-1 ring-inset ring-line">
          <img src={provider ? getProviderIcon(provider) : undefined} alt="" className="size-6" />
        </span>
      }
      eyebrow={config ? "Edit model provider" : "Set up model provider"}
      title={provider?.label}
      footer={
        <>
          <StatusLine tone={step === "models" && enabledCount > 0 ? "open" : "idle"}>
            {step === "credential"
              ? "Step 1 of 2 · Choose a credential"
              : `${enabledCount} ${pluralize(enabledCount, "model")} enabled`}
          </StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            {step === "models" && (
              <CardDialogButton onClick={() => setStep("credential")} disabled={isSaving}>
                Back
              </CardDialogButton>
            )}
            <CardDialogButton onClick={handleClose} disabled={isSaving}>
              Cancel
            </CardDialogButton>
            {step === "credential" ? (
              <CardDialogButton
                variant="primary"
                onClick={handleNext}
                disabled={!selectedCredentialName}
              >
                Next
              </CardDialogButton>
            ) : (
              <CardDialogButton
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || (!selectedCredentialName && !config?.credentialId)}
                isBusy={isSaving}
              >
                {isSaving ? "Saving" : "Save"}
              </CardDialogButton>
            )}
          </div>
        </>
      }
    >
      <p className="mb-4 text-[13px] leading-5 text-ink-2">
        {step === "credential"
          ? "Select the vault credential for this provider."
          : "Enable the models you want to use for this provider."}
      </p>

      {step === "credential" ? (
        credentialSelect
      ) : (
        <div className="space-y-4">
          {credentialSelect}

          <div className="flex items-center justify-between gap-4 rounded-md bg-sunken/80 px-3.5 py-3 ring-1 ring-line">
            <label htmlFor={disabledId} className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink">Disable provider</span>
              <span className="block text-[12px] text-muted-foreground">
                Disabled providers will not be available to use.
              </span>
            </label>
            <Switch
              id={disabledId}
              checked={isDisabled}
              onCheckedChange={(checked) => setIsDisabled(checked)}
              size="sm"
            />
          </div>

          {isProvidersLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-[13px] text-muted-foreground">
              <CircleNotchIcon className="size-4 animate-spin" />
              Loading models...
            </div>
          ) : (
            <>
              <div className="relative flex h-control-lg items-center rounded-md bg-popover ring-1 ring-border transition-shadow focus-within:ring-focus">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
                <input
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  aria-label="Search models"
                  placeholder="Search by model or capability..."
                  className="h-full w-full bg-transparent pl-10 pr-3 text-[13.5px] text-ink outline-none placeholder:text-muted-foreground"
                />
              </div>

              {filteredModels.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-muted-foreground">
                  No models match your search.
                </p>
              ) : (
                <ul className="max-h-[320px] divide-y divide-line overflow-y-auto overscroll-contain rounded-md ring-1 ring-line">
                  {filteredModels.map((model) => {
                    const capabilityLabel = formatCapabilityLabel(model.capability);
                    const supportedModalities = getSupportedModalities(model);

                    const capabilityBadge = capabilityLabel ? (
                      <Badge variant="secondary">{capabilityLabel}</Badge>
                    ) : null;

                    return (
                      <li
                        key={model.id}
                        className="flex items-center justify-between gap-2 px-3.5 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-[13px] text-ink">{model.id}</span>
                          {supportedModalities && capabilityBadge ? (
                            <Tooltip
                              content={`Supported modalities: ${supportedModalities.join(", ")}`}
                            >
                              <div className="inline-flex">{capabilityBadge}</div>
                            </Tooltip>
                          ) : (
                            capabilityBadge
                          )}
                        </div>
                        <Switch
                          aria-label={`Enable ${model.id}`}
                          checked={enabledModelIds.includes(model.id)}
                          onCheckedChange={() => toggleModel(model)}
                          size="sm"
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </div>
      )}
    </CardDialog>
  );
};
