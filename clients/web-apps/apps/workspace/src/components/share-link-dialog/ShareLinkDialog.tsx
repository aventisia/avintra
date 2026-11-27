import { IconTile } from "@avplatform/ui/icon-tile";
import { DIALOG_CONTROL, FIELD_CONTAINER, cn } from "@avplatform/ui/lib";
import { ChatCircleIcon, CopyIcon, FileTextIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import { useEffect, useId, useReducer } from "react";
import { toast } from "sonner";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";

import {
  type ShareLinkState,
  initialShareLinkState,
  shareLinkReducer,
} from "./share-link-flow.util";

export type ShareLinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: "chat" | "file";
  name: string;
  isShared: boolean;
  /** Resolves with the absolute link; safe to call for an item that is already shared. */
  createLink: () => Promise<string>;
  /** Rejects when sharing could not be stopped. */
  stopSharing: () => Promise<void>;
};

type ShareLinkCardProps = Pick<
  ShareLinkDialogProps,
  "kind" | "name" | "isShared" | "createLink" | "stopSharing"
> & { onClose: () => void };

const copyLink = async (link: string) => {
  try {
    await navigator.clipboard.writeText(link);
    toast.success("Link copied");
  } catch {
    toast.error("Couldn't copy. Select the link and copy it.");
  }
};

const statusFor = (state: ShareLinkState) => {
  if (state.error === "create")
    return <StatusLine tone="error">Couldn't create the link. Try again.</StatusLine>;
  if (state.error === "stop")
    return <StatusLine tone="error">Couldn't stop sharing. Try again.</StatusLine>;
  switch (state.status) {
    case "off":
      return <StatusLine tone="idle">Not shared yet</StatusLine>;
    case "creating":
      return <StatusLine tone="pending">Getting the link</StatusLine>;
    case "on":
      return <StatusLine tone="open">Sharing is on</StatusLine>;
    case "stopping":
      return <StatusLine tone="pending">Stopping</StatusLine>;
  }
};

const ShareLinkCard = ({
  kind,
  name,
  isShared,
  createLink,
  stopSharing,
  onClose,
}: ShareLinkCardProps) => {
  const [state, dispatch] = useReducer(shareLinkReducer, isShared, initialShareLinkState);
  const linkId = useId();
  const isChat = kind === "chat";
  const isWorking = state.status === "creating" || state.status === "stopping";

  const runCreate = () =>
    createLink().then(
      (link) => dispatch({ type: "created", link }),
      () => dispatch({ type: "createFailed" }),
    );

  const create = () => {
    dispatch({ type: "create" });
    void runCreate();
  };

  const stop = () => {
    dispatch({ type: "stop" });
    stopSharing().then(
      () => dispatch({ type: "stopped" }),
      () => dispatch({ type: "stopFailed" }),
    );
  };

  useEffect(() => {
    if (isShared) void runCreate();
    // IMPORTANT NOTE: runs once per open; the dialog body is unmounted on close.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasLink = state.status === "on" || state.status === "stopping";

  const footer = (
    <>
      {statusFor(state)}
      <div className="flex items-center gap-2">
        {hasLink ? (
          <>
            <CardDialogButton
              variant="danger"
              isBusy={state.status === "stopping"}
              disabled={isWorking}
              onClick={stop}
            >
              Stop sharing
            </CardDialogButton>
            <CardDialogButton onClick={onClose} disabled={isWorking}>
              Done
            </CardDialogButton>
          </>
        ) : (
          <>
            <CardDialogButton onClick={onClose} disabled={isWorking}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="primary"
              isBusy={state.status === "creating"}
              disabled={isWorking}
              onClick={create}
            >
              {state.status === "creating" ? "Creating link" : "Create link"}
            </CardDialogButton>
          </>
        )}
      </div>
    </>
  );

  return (
    <CardDialog
      isOpen
      onClose={onClose}
      isDismissLocked={isWorking}
      widthClassName="w-[min(32rem,calc(100vw-2rem))]"
      mark={
        <span className="relative inline-flex">
          <IconTile
            Icon={isChat ? ChatCircleIcon : FileTextIcon}
            size="xl"
            tone={isChat ? "neutral" : "sky"}
            className="size-12 [&>svg]:size-6"
          />
          <span
            aria-hidden
            className="absolute -bottom-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-surface"
          >
            <ShareNetworkIcon weight="bold" className="size-3" />
          </span>
        </span>
      }
      eyebrow={`Share ${kind}`}
      title={name}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <p className="text-[13px] leading-5 text-muted-foreground">
          Anyone signed in to this workspace who has the link can read this {kind}, but not edit it.
        </p>
        {hasLink && (
          <FormField htmlFor={linkId} label="Read-only link">
            <div
              className={cn(
                FIELD_CONTAINER,
                DIALOG_CONTROL,
                "flex h-11 items-stretch overflow-hidden",
              )}
            >
              <input
                id={linkId}
                readOnly
                value={state.link ?? ""}
                onFocus={(event) => event.currentTarget.select()}
                className="min-w-0 flex-1 bg-transparent px-3.5 outline-none"
              />
              <button
                type="button"
                onClick={() => void copyLink(state.link ?? "")}
                className="inline-flex shrink-0 items-center gap-2 border-l border-line-field px-3.5 text-[13px] font-medium text-ink-2 outline-none transition hover:bg-muted hover:text-ink focus-visible:bg-muted"
              >
                <CopyIcon className="size-4" />
                Copy
              </button>
            </div>
          </FormField>
        )}
      </div>
    </CardDialog>
  );
};

export const ShareLinkDialog = ({ open, onOpenChange, ...card }: ShareLinkDialogProps) =>
  open ? <ShareLinkCard {...card} onClose={() => onOpenChange(false)} /> : null;
