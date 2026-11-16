import { Toggle } from "@avplatform/ui/toggle";
import {
  BoldIcon,
  H2Icon,
  H3Icon,
  ItalicIcon,
  ListBulletIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import { Editor } from "@tiptap/react";

import { RichTextLinkButton } from "./RichTextLinkButton";

const RichTextToolbar = ({ editor }: { editor: Editor }) => {
  const formatButtons = [
    {
      label: "Bold",
      icon: BoldIcon,
      isActive: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      icon: ItalicIcon,
      isActive: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Heading 2",
      icon: H2Icon,
      isActive: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "Heading 3",
      icon: H3Icon,
      isActive: editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Bullet list",
      icon: ListBulletIcon,
      isActive: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      icon: NumberedListIcon,
      isActive: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className="flex items-center gap-0.5 border-b border-input px-1 py-0.5">
      {formatButtons.map(({ label, icon: Icon, isActive, run }) => (
        <Toggle
          key={label}
          size="sm"
          className="h-6 min-w-6 px-1"
          aria-label={label}
          pressed={isActive}
          onPressedChange={run}
        >
          <Icon />
        </Toggle>
      ))}
      <RichTextLinkButton editor={editor} />
    </div>
  );
};

export { RichTextToolbar };
