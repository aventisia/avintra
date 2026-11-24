import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { MOD_KEY_LABEL, SHIFT_KEY_LABEL } from "@avplatform/ui/utils";

type Shortcut = { keys: string[]; label: string };

const SHORTCUT_GROUPS: { title: string; shortcuts: Shortcut[] }[] = [
  {
    title: "Composer",
    shortcuts: [
      { keys: ["Enter"], label: "Send the message" },
      { keys: [SHIFT_KEY_LABEL, "Enter"], label: "Add a new line" },
      { keys: ["↑"], label: "Edit your last message when the box is empty" },
      { keys: ["Esc"], label: "Stop the reply" },
      { keys: ["/"], label: "Insert a command" },
      { keys: ["@"], label: "Mention a file" },
    ],
  },
  {
    title: "Anywhere in Home",
    shortcuts: [
      { keys: [MOD_KEY_LABEL, SHIFT_KEY_LABEL, "O"], label: "Start a new chat" },
      { keys: [MOD_KEY_LABEL, "K"], label: "Search the app" },
      { keys: [MOD_KEY_LABEL, "/"], label: "Show these shortcuts" },
      { keys: ["?"], label: "Open help, outside a text box" },
    ],
  },
  {
    title: "File preview",
    shortcuts: [{ keys: ["←", "→"], label: "Resize the preview while its divider has focus" }],
  },
];

type HomeChatShortcutsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Lists the keyboard shortcuts Home chat supports. */
export const HomeChatShortcutsDialog = ({ open, onOpenChange }: HomeChatShortcutsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-[480px]">
      <DialogDefaultHeader
        heading="Keyboard shortcuts"
        description={`Press ${MOD_KEY_LABEL} / to open this list again.`}
      />
      <div className="flex max-h-[70dvh] flex-col gap-5 overflow-y-auto px-5 py-4">
        {SHORTCUT_GROUPS.map((group) => (
          <section key={group.title}>
            <h3 className="mb-1.5 text-body-sm font-semibold text-ink">{group.title}</h3>
            <ul className="flex flex-col">
              {group.shortcuts.map((shortcut) => (
                <li
                  key={shortcut.label}
                  className="flex items-center justify-between gap-4 border-b border-line/60 py-2 last:border-b-0"
                >
                  <span className="text-body-sm text-ink-2">{shortcut.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {shortcut.keys.map((key) => (
                      <kbd
                        key={key}
                        className="inline-grid h-6 min-w-6 place-items-center rounded-[5px] border border-b-2 border-line-strong/30 border-b-line-strong/55 bg-surface px-1.5 font-sans text-[11.5px] font-medium leading-none text-ink-2"
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);
