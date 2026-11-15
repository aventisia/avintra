import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { listLanguages, listVoices } from "../apis/voice-catalog.apis";
import { voiceProviderData } from "../constants/voice-providers.constant";
import type { VoiceCatalogCapability } from "../dtos/voice-catalog.dto";
import type { VoiceOption, VoiceProviderData } from "../types/voice-provider.type";

export const VOICE_CATALOG_QUERY_KEY = ["voice-catalog"] as const;

type VoiceCatalogRequest = {
  provider?: string;
  model?: string;
  capability: VoiceCatalogCapability;
  credentialName?: string;
  enabled?: boolean;
};

const EMPTY_PROVIDER_DATA: VoiceProviderData = { languages: [], voices: [] };

export const useVoiceCatalog = ({
  provider,
  model,
  capability,
  credentialName,
  enabled = true,
}: VoiceCatalogRequest) => {
  const tenantId = useUserSessionStore(useShallow((state) => state.userSession?.tenantId ?? ""));
  const isEnabled = enabled && Boolean(tenantId) && Boolean(provider && model);
  const credential = credentialName?.trim() || undefined;
  const queryKey = [...VOICE_CATALOG_QUERY_KEY, tenantId, provider, model, capability, credential];
  const query = {
    provider: provider as string,
    model: model as string,
    capability,
    credential_name: credential,
  };

  const voicesQuery = useQuery({
    queryKey: [...queryKey, "voices"],
    queryFn: () => listVoices(query),
    enabled: isEnabled,
    retry: false,
    staleTime: 60_000,
  });

  const languagesQuery = useQuery({
    queryKey: [...queryKey, "languages"],
    queryFn: () => listLanguages(query),
    enabled: isEnabled,
    retry: false,
    staleTime: 60_000,
  });

  const staticData = provider ? voiceProviderData[provider] : undefined;

  const voices = useMemo<VoiceOption[]>(() => {
    const liveVoices = voicesQuery.data?.voices;
    if (liveVoices?.length) {
      return liveVoices.map((voice) => ({
        label: voice.name,
        value: voice.id,
        sample: voice.sample,
      }));
    }
    return staticData?.voices ?? EMPTY_PROVIDER_DATA.voices;
  }, [staticData, voicesQuery.data]);

  const languages = useMemo(() => {
    const liveLanguages = languagesQuery.data?.languages;
    if (liveLanguages?.length) {
      return liveLanguages.map((language) => ({ label: language.name, value: language.id }));
    }
    return staticData?.languages ?? EMPTY_PROVIDER_DATA.languages;
  }, [staticData, languagesQuery.data]);

  const isLoading = isEnabled && (voicesQuery.isLoading || languagesQuery.isLoading);
  const isReady = !isEnabled || !isLoading;

  return useMemo(
    () => ({ providerData: { voices, languages }, isLoading, isReady }),
    [voices, languages, isLoading, isReady],
  );
};
