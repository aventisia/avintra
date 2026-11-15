import { IHttpResponse } from "@avplatform/ui/dtos";
import type { VoiceSessionRequest, VoiceSessionResponse } from "@avplatform/voice-client";
import axios from "axios";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

const toServerMessage = (error: unknown) =>
  axios.isAxiosError(error) && typeof error.response?.data === "string"
    ? error.response.data
    : null;

/**
 * Creates one caller-bound LiveKit session for a VoiceAgent.
 */
export const createVoiceSession = async (voiceSessionRequestDto: VoiceSessionRequest) => {
  try {
    const response = await axiosInstance.post<IHttpResponse<VoiceSessionResponse>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/voice/sessions`,
      voiceSessionRequestDto,
      { headers: getSpaceHeaders() },
    );
    return response.data;
  } catch (error) {
    const serverMessage = toServerMessage(error);
    if (serverMessage) throw new Error(serverMessage);
    throw error;
  }
};
