import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ["control-xs", "control-sm", "control-md", "control-lg", "row"],
    },
    classGroups: {
      shadow: [{ shadow: ["pop", "focus", "select"] }],
      "font-size": [
        {
          text: [
            "display",
            "title",
            "heading",
            "body",
            "body-sm",
            "button",
            "hint",
            "label",
            "code",
          ],
        },
      ],
    },
  },
});

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export { cn };
