import { Separator, Switch } from "@avplatform/ui";
import { Input } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPrimitive,
  DialogTitle,
  DialogWrapper,
} from "@avplatform/ui/dialog";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getVaultCredentialSelectOptions } from "@/features/02-configure/queues/queues-table/apis/vault-credential-select.apis";

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

  return (
    <DialogWrapper open={isOpen} onOpenChangeFn={handleClose}>
      <DialogContent className="w-full max-w-[38rem]">
        <DialogHeader className="px-6 py-4 pb-2">
          <DialogTitle className="justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-accent p-2">
                <img
                  src={provider ? getProviderIcon(provider) : undefined}
                  alt={provider?.label}
                  className="h-6 w-6"
                />
              </div>
              <p>{provider?.label} — Setup</p>
            </div>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon8">
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogPrimitive.Close>
          </DialogTitle>
          <DialogDescription className="pr-4">
            {step === "credential"
              ? "Select the vault credential for this provider."
              : "Enable the models you want to use for this provider."}
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="px-6 py-4">
          {step === "credential" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Credential</label>
                <Select
                  value={selectedCredentialName}
                  onValueChange={(value) => setSelectedCredentialName(value)}
                  disabled={isCredentialLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isCredentialLoading ? "Loading credentials..." : "Select credential"
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
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleNext} disabled={!selectedCredentialName}>
                  Next
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Credential</label>
                <Select
                  value={selectedCredentialName}
                  onValueChange={(value) => setSelectedCredentialName(value)}
                  disabled={isCredentialLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select credential" />
                  </SelectTrigger>
                  <SelectContent>
                    {credentialOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Disable provider</p>
                  <p className="text-xs text-muted-foreground">
                    Disabled providers will not be available to use.
                  </p>
                </div>
                <Switch
                  checked={isDisabled}
                  onCheckedChange={(checked) => setIsDisabled(checked)}
                  size="sm"
                />
              </div>

              {isProvidersLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading models...
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      placeholder="Search by model or capability..."
                      className="pl-8"
                    />
                  </div>

                  {filteredModels.length === 0 ? (
                    <p className="py-8 text-center text-sm italic text-muted-foreground">
                      No models match your search.
                    </p>
                  ) : (
                    <div className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
                      {filteredModels.map((model) => {
                        const capabilityLabel = formatCapabilityLabel(model.capability);
                        const supportedModalities = getSupportedModalities(model);

                        const capabilityBadge = capabilityLabel ? (
                          <Badge className="bg-slate-200 text-slate-600">{capabilityLabel}</Badge>
                        ) : null;

                        return (
                          <div
                            key={model.id}
                            className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="truncate text-sm">{model.id}</span>
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
                              checked={enabledModelIds.includes(model.id)}
                              onCheckedChange={() => toggleModel(model)}
                              size="sm"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between gap-2">
                <Button variant="ghost" onClick={() => setStep("credential")}>
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      upsertMutation.isPending || (!selectedCredentialName && !config?.credentialId)
                    }
                  >
                    {upsertMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </DialogWrapper>
  );
};
