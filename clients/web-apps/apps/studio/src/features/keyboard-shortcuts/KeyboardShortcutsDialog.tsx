import { Button } from "@avplatform/ui/buttons";
import React from "react";
import { ScrollArea } from "@avplatform/ui/scroll";
import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@avplatform/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useKeyboardShortcutsStore } from "./stores/keyboard-shortcuts-store";

interface Shortcut {
  keys: (string | React.ReactNode)[]; // Keys can include either string or icons
  description: string;
}

interface ShortcutSection {
  title: string;
  shortcuts: Shortcut[];
}

const ShortcutsDialog = () => {
  const { showDialog, setShowDialog } = useKeyboardShortcutsStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  const shortcutSections: ShortcutSection[] = [
    {
      title: "General",
      shortcuts: [
        {
          keys: ["Ctrl", "K"],
          description: "Open the search bar",
        },
        {
          keys: ["Esc"],
          description: "Close currently open dialog",
        },
      ],
    },
    {
      title: "Canvas",
      shortcuts: [
        {
          keys: ["Shift", "Drag"],
          description: "Select Nodes and edges on canvas",
        },
        {
          keys: ["Ctrl", "Scroll"],
          description: "Zoom In/Out the Canvas",
        },
        {
          keys: ["Shift", " Scroll"],
          description: "Horizontal canvas movement",
        },
      ],
    },
    {
      title: "Nodes/Edges",
      shortcuts: [
        {
          keys: [<ChevronLeft size={16} />],
          description: "Move the selected node to the left",
        },
        {
          keys: [<ChevronRight size={16} />],
          description: "Move the selected node to the right",
        },
        {
          keys: ["Shift", <ChevronLeft size={16} />],
          description: "Quickly move the selected node to the left",
        },
        {
          keys: ["Shift", <ChevronRight size={16} />],
          description: "Quickly move the selected node to the right",
        },
        {
          keys: [<ChevronUp size={16} />],
          description: "Move the selected node up",
        },
        {
          keys: [<ChevronDown size={16} />],
          description: "Move the selected node down",
        },
        {
          keys: ["Shift", <ChevronUp size={16} />],
          description: "Quickly move the selected node up",
        },
        {
          keys: ["Shift", <ChevronDown size={16} />],
          description: "Quickly move the selected node down",
        },
        {
          keys: ["Delete"],
          description: "Remove selected node",
        },
        {
          keys: ["Delete"],
          description: "Remove selected edge",
        },
      ],
    },
  ];

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-3xl">
        <DialogDefaultHeader
          heading="Keyboard Shortcuts"
          description="Quick reference for all available keyboard shortcuts"
        />
        <ScrollArea className="h-[80vh]">
          <div className="space-y-6 p-4">
            {shortcutSections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {section.shortcuts.map((shortcut, shortcutIdx) => (
                    <div
                      key={shortcutIdx}
                      className="flex items-center justify-between rounded-lg border bg-slate-50 px-3 py-2"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {/* Render icons instead of text keys */}
                        {shortcut.keys.map((key, keyIdx) => (
                          <React.Fragment key={keyIdx}>
                            <Button variant={"outline"} size={"xs"}>
                              {key}
                            </Button>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-xs text-gray-400">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ShortcutsDialog;
