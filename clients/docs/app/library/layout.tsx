import type { Metadata } from "next";
import { DotPattern } from "../_components/ui/DotPattern";

import "@/features/worc-library/styles/library.css";
import { cn } from "@/lib";

export const metadata: Metadata = {
  title: {
    default: "Library - Aventisia",
    template: "%s | Library | Aventisia",
  },
  description: "Browse and explore Aventisia templates.",
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className=" relative bg-background  min-h-screen overflow-hidden">
        <DotPattern
          className={cn(
            " mt-2   w-screen  h-screen opacity-60",
            "[mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)]"
          )}
        />
        <div className="max-w-[90rem] p-6 mx-auto">{children}</div>
      </div>
    </>
  );
}
