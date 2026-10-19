import { createVoiceSfx } from "@avplatform/assistant-chat";
import { useEffect, useMemo } from "react";

/**
 * Plays VoiceAgent sound effects in the browser and stops the ambience when
 * the component unmounts.
 */
export const useVoiceSfx = () => {
  const sfx = useMemo(() => createVoiceSfx(), []);

  useEffect(() => () => sfx.stopAmbience(), [sfx]);

  return sfx;
};
