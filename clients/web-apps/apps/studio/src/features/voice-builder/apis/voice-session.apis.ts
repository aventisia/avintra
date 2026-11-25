import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";
import type { VoiceSessionRequest, VoiceSessionResponse } from "@avplatform/voice-client";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

/**
 * Creates one caller-bound LiveKit session for a VoiceAgent.
 */
export const createVoiceSession = (
  voiceSessionRequestDto: VoiceSessionRequest,
  signal?: AbortSignal,
) =>
  axiosInstance
    .post<IHttpResponse<VoiceSessionResponse>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/voice/sessions`,
      voiceSessionRequestDto,
      { headers: getStudioSpaceHeaders(), signal },
    )
    .then((res) => res.data);
