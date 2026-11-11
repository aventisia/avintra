import { axiosInstance } from "@avplatform/ui/lib";

import { getSpaceHeaders } from "@/utils/space-headers";

import { type HomeChatSpeechModel } from "../hooks/useHomeChatModels.hook";

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/** Transcribes a voice recording through the llmpipeline speech-to-text route. */
export const transcribeSpeech = async (
  audio: Blob,
  model: HomeChatSpeechModel,
  conversationId?: string,
) => {
  const response = await axiosInstance.post<{ output?: string | null; error?: string | null }>(
    `${import.meta.env.VITE_LLMPIPELINE_API_PATH}/v2/llm/stt/transcribe`,
    {
      input: await blobToDataUrl(audio),
      provider: model.provider,
      model: model.modelId,
      audio_format: audio.type || "audio/webm",
      stream: false,
      credential_name: model.credentialName,
      is_byok_enabled: model.isByokEnabled,
      ref_type: "LandingChat",
      ref_id: conversationId ?? "",
      ref_name: "Landing Chat",
      action: "LandingChat",
    },
    { headers: getSpaceHeaders() },
  );
  if (response.data.error) throw new Error(response.data.error);
  return response.data.output ?? "";
};
