const DRAFT_PREFIX = "av-chat-draft:";

export const readComposerDraft = (draftKey: string) => {
  try {
    return localStorage.getItem(DRAFT_PREFIX + draftKey) ?? "";
  } catch {
    return "";
  }
};

export const writeComposerDraft = (draftKey: string, text: string) => {
  try {
    if (text.trim()) localStorage.setItem(DRAFT_PREFIX + draftKey, text);
    else localStorage.removeItem(DRAFT_PREFIX + draftKey);
  } catch {
    return;
  }
};

/** Adds text to the end of a composer's saved draft, so the composer shows it when it next opens. */
export const appendToComposerDraft = (draftKey: string, text: string) => {
  const draft = readComposerDraft(draftKey).trimEnd();
  writeComposerDraft(draftKey, draft ? `${draft} ${text}` : text);
};
