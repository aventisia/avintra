import { useAuiState } from "@assistant-ui/react";
import { CircleNotchIcon, FileTextIcon } from "@phosphor-icons/react";
import type { FC } from "react";

import { peekWorkspaceChatArtifact } from "../utils/workspace-chat-html-artifact.util";
import { WorkspaceChatFileCard } from "./WorkspaceChatFileCard";

export type WorkspaceChatAssistantArtifactMatch = {
  id: string;
  name: string;
  contentType: string;
  sizeBytes: number;
};

type WorkspaceChatAssistantArtifactProps = {
  resolveArtifact: (text: string) => WorkspaceChatAssistantArtifactMatch | null;
  isArtifactFailed: (text: string) => boolean;
  onPreview: (artifactId: string) => void;
};

/**
 * File card for the code the assistant generated in this message. While the
 * file is still streaming or saving, a generating card holds its place so the
 * raw code never shows in the thread; only a failed save falls back to code.
 */
export const WorkspaceChatAssistantArtifact: FC<WorkspaceChatAssistantArtifactProps> = ({
  resolveArtifact,
  isArtifactFailed,
  onPreview,
}) => {
  const parts = useAuiState((state) => state.message.parts);
  const text = (parts ?? [])
    .filter((part) => (part as { type?: string }).type === "text")
    .map((part) => (part as { text?: string }).text ?? "")
    .join("");
  if (!text) return null;

  const match = resolveArtifact(text);
  if (match) {
    return (
      <div className="aui-workspace-chat-assistant-artifact my-2">
        <WorkspaceChatFileCard
          artifactId={match.id}
          name={match.name}
          contentType={match.contentType}
          sizeBytes={match.sizeBytes}
          onPreview={onPreview}
        />
      </div>
    );
  }

  if (isArtifactFailed(text)) {
    return (
      <p className="aui-workspace-chat-assistant-artifact my-2 text-xs text-bad">
        The file preview couldn&apos;t be saved — the code is shown above.
      </p>
    );
  }

  const pending = peekWorkspaceChatArtifact(text);
  if (!pending) return null;

  return (
    <div className="aui-workspace-chat-assistant-artifact my-2 flex items-center gap-2.5 rounded-lg border border-line bg-sunken/40 px-3 py-2.5">
      <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-ink">{pending.name}</p>
        <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <CircleNotchIcon className="size-3 animate-spin text-primary" />
          Generating preview…
        </p>
      </div>
    </div>
  );
};
