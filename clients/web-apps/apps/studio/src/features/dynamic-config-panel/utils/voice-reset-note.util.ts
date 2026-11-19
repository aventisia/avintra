type VoiceResetInput = {
  providerChanged: boolean;
  languageChanged: boolean;
  language?: string;
  voice?: string;
};

/** Names what a provider or language change cleared, for the note under the voice pickers. */
export const getVoiceClearedNote = ({
  providerChanged,
  languageChanged,
  language,
  voice,
}: VoiceResetInput): string | null => {
  if (providerChanged) {
    const cleared = [language ? "language" : null, voice ? "voice" : null].filter(Boolean);
    if (cleared.length === 0) return null;
    const verb = cleared.length > 1 ? "were" : "was";
    return `The ${cleared.join(" and ")} ${verb} cleared because the provider changed.`;
  }

  if (languageChanged && voice) return "The voice was cleared because the language changed.";

  return null;
};
