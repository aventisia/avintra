import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { Toggle } from "@avplatform/ui/toggle";
import { LinkIcon } from "@heroicons/react/24/outline";
import { Editor } from "@tiptap/react";
import * as React from "react";

const RichTextLinkButton = ({ editor }: { editor: Editor }) => {
  const [url, setUrl] = React.useState("");

  const applyLink = () => {
    const chain = editor.chain().focus().extendMarkRange("link");
    (url ? chain.setLink({ href: url }) : chain.unsetLink()).run();
  };

  return (
    <Popover onOpenChange={(open) => open && setUrl(editor.getAttributes("link").href ?? "")}>
      <PopoverTrigger asChild>
        <Toggle
          size="sm"
          className="h-6 min-w-6 px-1"
          pressed={editor.isActive("link")}
          aria-label="Link"
        >
          <LinkIcon />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <input
          className="h-7 w-full rounded-md border border-input bg-transparent px-2 text-xs outline-none"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyLink();
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export { RichTextLinkButton };
