import { useAui, useAuiState } from "@assistant-ui/react";
import { useEffect } from "react";

import { readComposerDraft, writeComposerDraft } from "../utils/composer-draft.util";

/** Keeps the composer's unsent text in local storage under `draftKey`, and restores it on mount. */
export const useComposerDraft = (draftKey: string | undefined) => {
  const aui = useAui();
  const text = useAuiState((s) => s.composer.text);

  useEffect(() => {
    if (!draftKey) return;
    const draft = readComposerDraft(draftKey);
    if (draft && !aui.composer.getState().text) aui.composer.setText(draft);
  }, [aui, draftKey]);

  useEffect(() => {
    if (draftKey) writeComposerDraft(draftKey, text);
  }, [draftKey, text]);
};
