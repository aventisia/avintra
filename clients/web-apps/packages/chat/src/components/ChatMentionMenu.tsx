import { ComposerPrimitive, unstable_useMentionAdapter } from "@assistant-ui/react";
import { type Icon } from "@phosphor-icons/react";
import { useMemo } from "react";

/** A file offered while the composer contains `@`. */
export type ChatMention = {
  /** Stable id of the mention target. */
  id: string;
  /** Shown in the menu and inserted after `@`. */
  label: string;
  description: string;
  icon: Icon;
};

type ChatMentionMenuProps = {
  mentions: readonly ChatMention[];
};

/** Lists the files matching `@` and inserts the one picked. */
export const ChatMentionMenu = ({ mentions }: ChatMentionMenuProps) => {
  const mention = unstable_useMentionAdapter({
    items: useMemo(
      () =>
        mentions.map((item) => ({
          id: item.id,
          type: "file",
          label: item.label,
          description: item.description,
        })),
      [mentions],
    ),
  });

  return (
    <ComposerPrimitive.TriggerPopover
      char="@"
      adapter={mention.adapter}
      aria-label="Mentions"
      className="absolute inset-x-0 bottom-full z-20 mb-2 max-h-72 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-lg"
    >
      <ComposerPrimitive.TriggerPopover.Directive {...mention.directive} />
      <ComposerPrimitive.TriggerPopoverItems>
        {(items) =>
          items.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">No matching files</p>
          ) : (
            items.map((item, index) => {
              const mentionItem = mentions.find((candidate) => candidate.id === item.id);
              const MentionIcon = mentionItem?.icon;
              return (
                <ComposerPrimitive.TriggerPopoverItem
                  key={item.id}
                  item={item}
                  index={index}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ink outline-none data-[highlighted]:bg-hover"
                >
                  {MentionIcon && <MentionIcon className="size-4 shrink-0 text-muted-foreground" />}
                  <span className="font-medium">@{mentionItem?.label ?? item.id}</span>
                  <span className="truncate text-muted-foreground">{mentionItem?.description}</span>
                </ComposerPrimitive.TriggerPopoverItem>
              );
            })
          )
        }
      </ComposerPrimitive.TriggerPopoverItems>
    </ComposerPrimitive.TriggerPopover>
  );
};
