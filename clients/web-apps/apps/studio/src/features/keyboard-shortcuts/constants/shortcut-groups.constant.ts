import type { Shortcut, ShortcutGroup } from "../types/shortcut.type";

export const FIND_NODE_SHORTCUT: Shortcut = {
  label: "Find a node",
  modifiers: ["ctrl"],
  key: "k",
};

export const IMPORT_SHORTCUT: Shortcut = {
  label: "Import an agent",
  modifiers: ["mod"],
  key: "o",
};

export const EXPORT_SHORTCUT: Shortcut = {
  label: "Export the agent",
  modifiers: ["mod"],
  key: "e",
};

export const KEYBOARD_SHORTCUTS_SHORTCUT: Shortcut = {
  label: "Show keyboard shortcuts",
  modifiers: ["mod"],
  key: "slash",
};

const GENERAL: ShortcutGroup = {
  title: "General",
  shortcuts: [
    FIND_NODE_SHORTCUT,
    IMPORT_SHORTCUT,
    EXPORT_SHORTCUT,
    KEYBOARD_SHORTCUTS_SHORTCUT,
    { label: "Save changes", modifiers: ["mod"], key: "s" },
    { label: "Close a dialog or panel", modifiers: [], key: "escape" },
  ],
};

const CANVAS: ShortcutGroup = {
  title: "Canvas",
  shortcuts: [
    { label: "Pan the canvas", modifiers: [], gesture: "scroll" },
    { label: "Pan sideways", modifiers: ["shift"], gesture: "scroll" },
    { label: "Zoom in or out", modifiers: ["mod"], gesture: "scroll" },
    { label: "Pan by dragging", modifiers: [], key: "space", gesture: "drag" },
    { label: "Select an area", modifiers: ["shift"], gesture: "drag" },
    { label: "Add a node to the selection", modifiers: ["mod"], gesture: "click" },
  ],
};

const NODES: ShortcutGroup = {
  title: "Nodes and edges",
  shortcuts: [
    { label: "Copy selected nodes", modifiers: ["mod"], key: "c" },
    { label: "Cut selected nodes", modifiers: ["mod"], key: "x" },
    { label: "Paste after the selected node", modifiers: ["mod"], key: "v" },
    { label: "Paste before the selected node", modifiers: ["mod", "shift"], key: "v" },
    { label: "Enable or disable selected nodes", modifiers: ["mod"], key: "d" },
    { label: "Delete the selection", modifiers: [], key: "delete" },
    { label: "Nudge selected nodes", modifiers: [], key: "arrows" },
    { label: "Nudge four times as far", modifiers: ["shift"], key: "arrows" },
  ],
};

export const SHORTCUT_COLUMNS: ShortcutGroup[][] = [[GENERAL, CANVAS], [NODES]];

export const ALL_SHORTCUTS = SHORTCUT_COLUMNS.flat().flatMap((group) => group.shortcuts);
