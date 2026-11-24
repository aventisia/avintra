import { ChatIconButton } from "@avplatform/chat";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { formatDate } from "@avplatform/ui/utils";
import {
  ChatCircleIcon,
  CircleNotchIcon,
  FileTextIcon,
  LinkBreakIcon,
  LinkSimpleIcon,
} from "@phosphor-icons/react";
import { type ReactNode } from "react";
import { Link } from "react-router-dom";

import { HOME_CHAT_CONVERSATION_ROUTE } from "../constants/home-chat.constant";
import { SHARED_CHATS_LIMIT, useHomeChatSharedLinks } from "../hooks/useHomeChatSharedLinks.hook";

type SharedLinkRow = {
  id: string;
  name: string;
  detail: string;
  href: string;
  icon: ReactNode;
};

const SharedLinkSection = ({
  title,
  rows,
  note,
  onOpen,
  onCopyLink,
  onStopSharing,
}: {
  title: string;
  rows: SharedLinkRow[];
  note?: string;
  onOpen: () => void;
  onCopyLink: (id: string) => void;
  onStopSharing: (id: string) => void;
}) => (
  <section aria-label={title}>
    <h3 className="mb-1.5 text-body-sm font-semibold text-ink">
      {title} <span className="font-normal text-muted-foreground">({rows.length})</span>
    </h3>
    {rows.length === 0 ? (
      <p className="py-2 text-body-sm text-muted-foreground">None shared.</p>
    ) : (
      <ul className="flex flex-col">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center gap-3 border-b border-line/60 py-1.5 last:border-b-0"
          >
            <span className="text-muted-foreground [&>svg]:size-4">{row.icon}</span>
            <Link to={row.href} onClick={onOpen} className="min-w-0 flex-1 hover:underline">
              <span className="block truncate text-body-sm text-ink">{row.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{row.detail}</span>
            </Link>
            <ChatIconButton label={`Copy link to ${row.name}`} onClick={() => onCopyLink(row.id)}>
              <LinkSimpleIcon />
            </ChatIconButton>
            <ChatIconButton
              label={`Stop sharing ${row.name}`}
              className="hover:text-bad"
              onClick={() => onStopSharing(row.id)}
            >
              <LinkBreakIcon />
            </ChatIconButton>
          </li>
        ))}
      </ul>
    )}
    {note && <p className="pt-2 text-xs text-muted-foreground">{note}</p>}
  </section>
);

type HomeChatSharedLinksDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Lists every chat and file the user has shared, to copy a link again or stop sharing it. */
export const HomeChatSharedLinksDialog = ({
  open,
  onOpenChange,
}: HomeChatSharedLinksDialogProps) => {
  const links = useHomeChatSharedLinks(open);
  const close = () => onOpenChange(false);

  const chatRows = links.chats.map<SharedLinkRow>((chat) => ({
    id: chat.id,
    name: chat.title,
    detail: `Updated ${formatDate(chat.lastModifiedOn)}`,
    href: `${HOME_CHAT_CONVERSATION_ROUTE}/${chat.id}`,
    icon: <ChatCircleIcon />,
  }));
  const fileRows = links.files.map<SharedLinkRow>((file) => ({
    id: file.id,
    name: file.versionNumber > 1 ? `${file.name} (v${file.versionNumber})` : file.name,
    detail: file.conversationTitle ?? "Chat file",
    href: `${HOME_CHAT_CONVERSATION_ROUTE}/${file.conversationId}?file=${file.id}`,
    icon: <FileTextIcon />,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <DialogDefaultHeader
          heading="Shared links"
          description="People signed in to this workspace can read a chat or file from its link. Stop sharing to turn its link off."
        />
        <div className="flex max-h-[70dvh] flex-col gap-5 overflow-y-auto px-5 py-4">
          {links.isLoading ? (
            <p className="flex items-center justify-center gap-2 py-8 text-body-sm text-muted-foreground">
              <CircleNotchIcon className="size-4 animate-spin" />
              Loading shared links
            </p>
          ) : links.isError ? (
            <p role="alert" className="py-8 text-center text-body-sm text-bad">
              Couldn't load your shared links.
            </p>
          ) : (
            <>
              <SharedLinkSection
                title="Chats"
                rows={chatRows}
                note={
                  links.hasMoreChats
                    ? `Showing the first ${SHARED_CHATS_LIMIT} shared chats.`
                    : undefined
                }
                onOpen={close}
                onCopyLink={links.copyChatLink}
                onStopSharing={links.stopSharingChat}
              />
              <SharedLinkSection
                title="Files"
                rows={fileRows}
                onOpen={close}
                onCopyLink={links.copyFileLink}
                onStopSharing={links.stopSharingFile}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
