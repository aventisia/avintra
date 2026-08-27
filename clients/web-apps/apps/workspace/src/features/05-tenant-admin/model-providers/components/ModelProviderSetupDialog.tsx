import { Separator, Switch } from "@avplatform/ui";
import { Input } from "@avplatform/ui";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getCredSelectOptions } from "@/features/02-configure/queues/queues-table/apis/app-secret-apis";

import {
  getLlmModelsV2,
  upsertModelProvider,
} from "../apis/model-provider-apis";
import {
  getProviderIcon,
  getVaultTypeForProvider,
} from "../constants/model-provider-definitions";
import { LlmModelInfoDto } from "../dtos/llm-provider-v2-dto";
import { TenantModelProviderDto } from "../dtos/model-provider-dto";
import { MODEL_PROVIDERS_QUERY_KEY } from "../hooks/useFetchModelProviders";
import { useModelProviderDialogStore } from "../store/model-provider-dialog-store";

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
  const [isDisabled, setIsDisabled] = useState(false);

  // v2 provider/model browsing state (credential-based providers)
  const [providerModels, setProviderModels] = useState<LlmModelInfoDto[]>([]);
  const [isProvidersLoading, setIsProvidersLoading] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  const resetState = () => {
    setStep("credential");
    setSelectedCredentialName("");
    setEnabledModelIds([]);
    setCredentialOptions([]);
    setIsDisabled(false);
    setProviderModels([]);
    setModelSearch("");
  };

  // When the dialog opens for a provider, load the vault credentials and, if a
  // saved configuration exists, pre-select the credential and pre-enable its models.
  useEffect(() => {
    if (!isOpen || !provider) return;

    // Reset internal state for a fresh configuration flow.
    resetState();

    setIsCredentialLoading(true);
    getCredSelectOptions(getVaultTypeForProvider(provider.value))
      .then((res) => {
        const options = res?.data ?? [];
        setCredentialOptions(options);

        // Pre-select the saved credential and its enabled models when re-configuring.
        if (config) {
          const savedCredential = config.credentialName ?? config.credentialId ?? "";
          setSelectedCredentialName(savedCredential);
          setEnabledModelIds(config.enabledModelIds ?? []);
          setIsDisabled(Boolean(config.isDisabled));
          // Skip straight to the models step so existing state is shown, and
          // load the provider's models so the list is populated.
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

  // Fetch the models for the selected provider from the LLM pipeline API
  // (`/v2/llm/models?provider=X`). The provider name is sent in lowercase.
  // For ollama providers the selected credential id is forwarded so the pipeline
  // echoes it back on each returned model.
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

    // When the credential dropdown was not re-selected (e.g. the stored credential
    // is a GUID that doesn't match any name-based option after a provider was
    // disabled), fall back to the previously saved credential so a disabled
    // provider can still be re-enabled.
    const credentialName = selectedCredentialName || config?.credentialName || "";
    const credentialId = config?.credentialId ?? null;

    if (!credentialName && !credentialId) return;

    upsertMutation.mutate({
      providerType: provider.value,
      credentialName,
      credentialId,
      enabledModelIds,
      isDisabled,
    });
  };

  const toggleModel = (modelValue: string) => {
    setEnabledModelIds((prev) =>
      prev.includes(modelValue) ? prev.filter((m) => m !== modelValue) : [...prev, modelValue],
    );
  };

  // Apply the model-name search to the selected provider's models.
  const filteredModels = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();
    return providerModels.filter((m) => {
      if (query && !m.id.toLowerCase().includes(query)) return false;
      return true;
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
              {/* Allow changing the selected credential */}
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

              {/* Disable/enable the provider */}
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
                  {/* Model search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      placeholder="Search models..."
                      className="pl-8"
                    />
                  </div>

                  {filteredModels.length === 0 ? (
                    <p className="py-8 text-center text-sm italic text-muted-foreground">
                      No models match your search.
                    </p>
                  ) : (
                    <div className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
                      {filteredModels.map((model) => (
                        <div
                          key={model.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                          <span className="truncate pr-2 text-sm">{model.id}</span>
                          <Switch
                            checked={enabledModelIds.includes(model.id)}
                            onCheckedChange={() => toggleModel(model.id)}
                            size="sm"
                          />
                        </div>
                      ))}
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
                      upsertMutation.isPending ||
                      (!selectedCredentialName && !config?.credentialId)
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
