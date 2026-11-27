import { ChatIconButton } from "@avplatform/chat";
import { IconTile, type IconTileTone } from "@avplatform/ui/icon-tile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { formatRelativeTime } from "@avplatform/ui/utils";
import {
  ChatCircleIcon,
  FileTextIcon,
  LinkBreakIcon,
  LinkSimpleIcon,
  ShareNetworkIcon,
} from "@phosphor-icons/react";
import { type ComponentProps } from "react";
import { Link } from "react-router-dom";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { pluralize } from "@/utils/pluralize.util";

import { HOME_CHAT_CONVERSATION_ROUTE } from "../constants/home-chat.constant";
import { SHARED_CHATS_LIMIT, useHomeChatSharedLinks } from "../hooks/useHomeChatSharedLinks.hook";

type SharedLinkRow = {
  id: string;
  name: string;
  detail: string;
  href: string;
};

type SharedLinkSectionProps = {
  rows: SharedLinkRow[];
  Icon: ComponentProps<typeof IconTile>["Icon"];
  tone: IconTileTone;
  emptyTitle: string;
  emptyHint: string;
  note?: string;
  onOpen: () => void;
  onCopyLink: (id: string) => void;
  onStopSharing: (id: string) => void;
};

const SharedLinkSection = ({
  rows,
  Icon,
  tone,
  emptyTitle,
  emptyHint,
  note,
  onOpen,
  onCopyLink,
  onStopSharing,
}: SharedLinkSectionProps) => {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-line-strong/40 bg-sunken/50 px-6 py-10 text-center">
        <IconTile Icon={Icon} size="xl" tone={tone} className="mb-2" />
        <p className="text-body-sm font-semibold text-ink">{emptyTitle}</p>
        <p className="max-w-[26rem] text-[12.5px] leading-5 text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex items-center gap-3 rounded-md bg-surface py-2 pl-2.5 pr-2 ring-1 ring-line transition hover:bg-muted/60 hover:ring-line-strong/40"
          >
            <IconTile Icon={Icon} size="md" tone={tone} />
            <Link
              to={row.href}
              onClick={onOpen}
              className="min-w-0 flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <span className="block truncate text-body-sm font-medium text-ink">{row.name}</span>
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
      {note && <p className="pt-2.5 text-xs text-muted-foreground">{note}</p>}
    </>
  );
};

const LoadingRows = () => (
  <div role="status" aria-label="Loading shared links" className="flex flex-col gap-2">
    {[0, 1, 2].map((index) => (
      <div
        key={index}
        className="flex animate-pulse items-center gap-3 rounded-md bg-surface py-2 pl-2.5 pr-2 ring-1 ring-line"
      >
        <span className="size-8 rounded-md bg-muted" />
        <span className="flex flex-1 flex-col gap-1.5">
          <span className="h-3 w-2/5 rounded-sm bg-muted" />
          <span className="h-2.5 w-1/4 rounded-sm bg-muted" />
        </span>
      </div>
    ))}
  </div>
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
    detail: `Updated ${formatRelativeTime(chat.lastModifiedOn)}`,
    href: `${HOME_CHAT_CONVERSATION_ROUTE}/${chat.id}`,
  }));
  const fileRows = links.files.map<SharedLinkRow>((file) => ({
    id: file.id,
    name: file.versionNumber > 1 ? `${file.name} (v${file.versionNumber})` : file.name,
    detail: file.conversationTitle ?? "Chat file",
    href: `${HOME_CHAT_CONVERSATION_ROUTE}/${file.conversationId}?file=${file.id}`,
  }));

  const status = links.isError ? (
    <StatusLine tone="error">Couldn't load your shared links.</StatusLine>
  ) : links.isLoading ? (
    <StatusLine tone="idle">Loading shared links</StatusLine>
  ) : (
    <StatusLine tone={chatRows.length + fileRows.length > 0 ? "open" : "idle"}>
      {chatRows.length + fileRows.length === 0
        ? "Nothing shared yet"
        : `${chatRows.length} ${pluralize(chatRows.length, "chat")} · ${fileRows.length} ${pluralize(fileRows.length, "file")} shared`}
    </StatusLine>
  );

  return (
    <CardDialog
      isOpen={open}
      onClose={close}
      widthClassName="w-[min(36rem,calc(100vw-2rem))]"
      mark={<IconTile Icon={ShareNetworkIcon} size="xl" className="size-12 [&>svg]:size-6" />}
      eyebrow="Chat"
      title="Shared links"
      footer={
        <>
          {status}
          <CardDialogButton onClick={close}>Done</CardDialogButton>
        </>
      }
    >
      <p className="pb-4 text-[13px] leading-5 text-muted-foreground">
        People signed in to this workspace can read a chat or file from its link. Stop sharing to
        turn its link off.
      </p>
      {links.isLoading ? (
        <LoadingRows />
      ) : links.isError ? (
        <p role="alert" className="py-8 text-center text-body-sm text-bad">
          Couldn't load your shared links.
        </p>
      ) : (
        <Tabs defaultValue="chats">
          <TabsList className="mb-3 flex w-full">
            <TabsTrigger value="chats">
              Chats <span className="font-normal tabular-nums">({chatRows.length})</span>
            </TabsTrigger>
            <TabsTrigger value="files">
              Files <span className="font-normal tabular-nums">({fileRows.length})</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="chats" className="mt-0">
            <SharedLinkSection
              rows={chatRows}
              Icon={ChatCircleIcon}
              tone="neutral"
              emptyTitle="No shared chats yet"
              emptyHint="Chats you share show up here, so you can copy their link again or turn it off."
              note={
                links.hasMoreChats
                  ? `Showing the first ${SHARED_CHATS_LIMIT} shared chats.`
                  : undefined
              }
              onOpen={close}
              onCopyLink={links.copyChatLink}
              onStopSharing={links.stopSharingChat}
            />
          </TabsContent>
          <TabsContent value="files" className="mt-0">
            <SharedLinkSection
              rows={fileRows}
              Icon={FileTextIcon}
              tone="sky"
              emptyTitle="No shared files yet"
              emptyHint="Files you share show up here, so you can copy their link again or turn it off."
              onOpen={close}
              onCopyLink={links.copyFileLink}
              onStopSharing={links.stopSharingFile}
            />
          </TabsContent>
        </Tabs>
      )}
    </CardDialog>
  );
};
