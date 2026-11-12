import { ChatFilePreview } from "@avplatform/chat";
import { Skeleton } from "@avplatform/ui";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { getSharedChatArtifact } from "@/features/04-assist/workspace-chat/apis/workspace-chat.apis";

/** A shared chat file as a read-only preview for signed-in members. */
export const SharedArtifactLayout = ({ shareToken }: { shareToken: string }) => {
  const artifact = useQuery({
    queryKey: ["shared-artifact", shareToken],
    queryFn: () => getSharedChatArtifact(shareToken),
    retry: false,
    staleTime: 30_000,
  });
  const file = artifact.data?.data;
  useDocumentTitle(file?.name ?? "Shared file");
  const navigate = useNavigate();

  if (artifact.isPending)
    return (
      <div
        role="status"
        aria-label="Loading shared file"
        className="mx-auto w-full max-w-3xl space-y-3 p-6"
      >
        <Skeleton className="h-6 w-1/2 rounded" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );

  if (artifact.isError || !file)
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 p-6 text-center">
        <h1 className="text-base font-medium text-ink">
          This link is invalid or sharing was stopped
        </h1>
        <Link to="/" className="text-sm text-muted-foreground underline">
          Back to Home
        </Link>
      </div>
    );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 bg-surface px-4 dark:bg-bg">
        <h1 className="truncate text-sm font-medium text-ink">{file.name}</h1>
        <span className="shrink-0 rounded-full bg-sunken px-2 py-0.5 text-xs text-muted-foreground dark:bg-fill">
          Read-only
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ChatFilePreview
          file={{
            name: file.name,
            contentType: file.contentType,
            sizeBytes: file.sizeBytes,
            url: file.blobPath.startsWith("data:") ? file.blobPath : null,
          }}
          isLoading={false}
          onClose={() => navigate("/")}
        />
      </div>
    </div>
  );
};
