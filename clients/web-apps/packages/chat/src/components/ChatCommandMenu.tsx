import { ComposerPrimitive, unstable_useSlashCommandAdapter, useAui } from "@assistant-ui/react";
import { type Icon } from "@phosphor-icons/react";
import { type RefObject, useMemo } from "react";

/** A `/` command offered while the composer starts with a slash. */
export type ChatCommand = {
  /** Typed after the slash. */
  id: string;
  description: string;
  icon: Icon;
} & (
  | {
      /** Text that replaces the command, ready for the user to finish. */
      prompt: string;
    }
  | { run: () => void }
);

const slashAtStart = (text: string, char: string, cursor: number) => {
  const query = text.slice(char.length, cursor);
  return text.startsWith(char) && !/\s/u.test(query)
    ? { query, offset: 0, endOffset: cursor }
    : null;
};

type ChatCommandMenuProps = {
  commands: readonly ChatCommand[];
  inputRef: RefObject<HTMLTextAreaElement>;
};

/** Lists the commands matching what follows a leading `/` and runs the one picked. */
export const ChatCommandMenu = ({ commands, inputRef }: ChatCommandMenuProps) => {
  const aui = useAui();
  const slash = unstable_useSlashCommandAdapter({
    removeOnExecute: true,
    commands: useMemo(
      () =>
        commands.map((command) => ({
          id: command.id,
          description: command.description,
          execute: () => {
            if ("run" in command) return command.run();
            // IMPORTANT NOTE: the composer may not reflect the trigger's removal yet, so the command text is stripped here too.
            const rest = aui.composer.getState().text.replace(/^\/\S*\s?/u, "");
            aui.composer.setText(command.prompt + rest);
            requestAnimationFrame(() => {
              inputRef.current?.focus();
              inputRef.current?.setSelectionRange(command.prompt.length, command.prompt.length);
            });
          },
        })),
      [aui, commands, inputRef],
    ),
  });

  return (
    <ComposerPrimitive.TriggerPopover
      char="/"
      matcher={slashAtStart}
      adapter={slash.adapter}
      aria-label="Commands"
      className="absolute inset-x-0 bottom-full z-20 mb-2 max-h-72 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 shadow-lg"
    >
      <ComposerPrimitive.TriggerPopover.Action {...slash.action} />
      <ComposerPrimitive.TriggerPopoverItems>
        {(items) =>
          items.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">No matching commands</p>
          ) : (
            items.map((item, index) => {
              const CommandIcon = commands.find((command) => command.id === item.id)?.icon;
              return (
                <ComposerPrimitive.TriggerPopoverItem
                  key={item.id}
                  item={item}
                  index={index}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-ink outline-none data-[highlighted]:bg-hover"
                >
                  {CommandIcon && <CommandIcon className="size-4 shrink-0 text-muted-foreground" />}
                  <span className="font-medium">/{item.id}</span>
                  <span className="truncate text-muted-foreground">{item.description}</span>
                </ComposerPrimitive.TriggerPopoverItem>
              );
            })
          )
        }
      </ComposerPrimitive.TriggerPopoverItems>
    </ComposerPrimitive.TriggerPopover>
  );
};
