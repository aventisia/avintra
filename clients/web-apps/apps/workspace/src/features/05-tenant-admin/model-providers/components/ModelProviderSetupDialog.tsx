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
  OllamaModelDto,
  getOllamaModels,
  upsertModelProvider,
} from "../apis/model-provider-apis";
import {
  getProviderIcon,
  getVaultTypeForProvider,
  isUrlBasedProvider,
} from "../constants/model-provider-definitions";
import { LlmModelInfoDto } from "../dtos/llm-provider-v2-dto";
import { TenantModelProviderDto } from "../dtos/model-provider-dto";
import { MODEL_PROVIDERS_QUERY_KEY } from "../hooks/useFetchModelProviders";
import { useModelProviderDialogStore } from "../store/model-provider-dialog-store";

type Step = "credential" | "models";

/**
 * Multi-step dialog for configuring a model provider.
 * For credential-based providers: choose a vault credential, then toggle models.
 * For URL-based providers (e.g. Ollama): enter the provider URL, then toggle models.
 */
export const ModelProviderSetupDialog = () => {
  const { isOpen, closeDialog, provider, config } = useModelProviderDialogStore();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>("credential");
  const [credentialOptions, setCredentialOptions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [isCredentialLoading, setIsCredentialLoading] = useState(false);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>("");
  const [enabledModelIds, setEnabledModelIds] = useState<string[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);

  // URL-based (Ollama) state
  const isUrlBased = Boolean(provider && isUrlBasedProvider(provider.value));
  const [providerUrl, setProviderUrl] = useState("");
  const [ollamaModels, setOllamaModels] = useState<OllamaModelDto[]>([]);
  const [isOllamaLoading, setIsOllamaLoading] = useState(false);

  // v2 provider/model browsing state (credential-based providers)
  const [providerModels, setProviderModels] = useState<LlmModelInfoDto[]>([]);
  const [isProvidersLoading, setIsProvidersLoading] = useState(false);
  const [modelSearch, setModelSearch] = useState("");

  const resetState = () => {
    setStep("credential");
    setSelectedCredentialId("");
    setEnabledModelIds([]);
    setCredentialOptions([]);
    setIsDisabled(false);
    setProviderUrl("");
    setOllamaModels([]);
    setProviderModels([]);
    setModelSearch("");
  };

  // When the dialog opens for a provider, load the vault credentials and, if a
  // saved configuration exists, pre-select the credential and pre-enable its models.
  useEffect(() => {
    if (!isOpen || !provider) return;

    // Reset internal state for a fresh configuration flow.
    resetState();

    if (isUrlBased) {
      // URL-based providers don't use vault credentials; pre-load saved URL/models.
      if (config) {
        setProviderUrl(config.providerUrl ?? "");
        setEnabledModelIds(config.enabledModelIds ?? []);
        setIsDisabled(Boolean(config.isDisabled));

        // Re-fetch models from the saved URL and jump to the models step.
        if (config.providerUrl) {
          setIsOllamaLoading(true);
          getOllamaModels(config.providerUrl)
            .then((res) => {
              setOllamaModels(res?.data ?? []);
              setStep("models");
            })
            .catch((err) => {
              console.error("Failed to fetch Ollama models", err);
              toast.error("Failed to connect to the Ollama server.");
            })
            .finally(() => setIsOllamaLoading(false));
        }
      }
      return;
    }

    setIsCredentialLoading(true);
    getCredSelectOptions(getVaultTypeForProvider(provider.value))
      .then((res) => {
        const options = res?.data ?? [];
        setCredentialOptions(options);

        // Pre-select the saved credential and its enabled models when re-configuring.
        if (config) {
          setSelectedCredentialId(config.credentialId ?? "");
          setEnabledModelIds(config.enabledModelIds ?? []);
          setIsDisabled(Boolean(config.isDisabled));
          // Skip straight to the models step so existing state is shown.
          setStep("models");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch credentials", err);
        toast.error("Failed to load credentials.");
      })
      .finally(() => setIsCredentialLoading(false));
  }, [isOpen, provider, config, isUrlBased]);

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
  const loadProviderModels = async () => {
    if (!provider) return;
    setIsProvidersLoading(true);
    setProviderModels([]);
    setModelSearch("");
    try {
      const modelsRes = await getLlmModelsV2(
        provider.value.toLowerCase(),
        undefined,
        selectedCredentialId,
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
    if (!selectedCredentialId) return;
    setStep("models");
    void loadProviderModels();
  };

  // Fetch models from the Ollama server at the entered URL.
  const handleOllamaNext = () => {
    if (!providerUrl.trim()) return;
    setIsOllamaLoading(true);
    getOllamaModels(providerUrl.trim())
      .then((res) => {
        setOllamaModels(res?.data ?? []);
        setStep("models");
      })
      .catch((err) => {
        console.error("Failed to fetch Ollama models", err);
        toast.error("Failed to connect to the Ollama server.");
      })
      .finally(() => setIsOllamaLoading(false));
  };

  const handleSave = () => {
    if (!provider) return;

    if (isUrlBased) {
      // Ollama uses a self-hosted URL; persist it and the enabled models.
      if (!providerUrl.trim()) return;
      upsertMutation.mutate({
        providerType: provider.value,
        credentialId: null,
        providerUrl: providerUrl.trim(),
        enabledModelIds,
        isDisabled,
      });
      return;
    }

    if (!selectedCredentialId) return;
    upsertMutation.mutate({
      providerType: provider.value,
      credentialId: selectedCredentialId,
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
              ? isUrlBased
                ? "Enter the URL of your self-hosted provider server."
                : "Select the vault credential for this provider."
              : "Enable the models you want to use for this provider."}
          </DialogDescription>
        </DialogHeader>
        <Separator />

        <div className="px-6 py-4">
          {step === "credential" ? (
            <div className="space-y-4">
              {isUrlBased ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provider URL</label>
                    <Input
                      value={providerUrl}
                      onChange={(e) => setProviderUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                      disabled={isOllamaLoading}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleOllamaNext}
                      disabled={!providerUrl.trim() || isOllamaLoading}
                    >
                      {isOllamaLoading ? "Connecting..." : "Next"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Credential</label>
                    <Select
                      value={selectedCredentialId}
                      onValueChange={(value) => setSelectedCredentialId(value)}
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
                    <Button onClick={handleNext} disabled={!selectedCredentialId}>
                      Next
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Allow changing the selected credential (credential-based providers only) */}
              {!isUrlBased && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Credential</label>
                  <Select
                    value={selectedCredentialId}
                    onValueChange={(value) => setSelectedCredentialId(value)}
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
              )}

              {/* Show the connected URL for URL-based providers */}
              {isUrlBased && (
                <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span className="font-medium">Provider URL</span>
                  <span className="text-muted-foreground">{providerUrl}</span>
                </div>
              )}

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

              {isOllamaLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading models...
                </div>
              ) : isUrlBased ? (
                ollamaModels.length === 0 ? (
                  <p className="py-8 text-center text-sm italic text-muted-foreground">
                    No models returned for this provider.
                  </p>
                ) : (
                  <div className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
                    {ollamaModels.map((model) => (
                      <div
                        key={model.name}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <span className="truncate pr-2 text-sm">{model.name}</span>
                        <Switch
                          checked={enabledModelIds.includes(model.name)}
                          onCheckedChange={() => toggleModel(model.name)}
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                )
              ) : isProvidersLoading ? (
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
                    disabled={upsertMutation.isPending || (!isUrlBased && !selectedCredentialId)}
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
