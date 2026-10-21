import { ScrollArea } from "@avplatform/ui/scroll";
import { useRef } from "react";
import { useParams } from "react-router-dom";

import { MyInterfaceDto } from "../dtos/my-interface-dto";
import { InterfaceListItem } from "./InterfaceListItem";

type InterfaceListProps = {
  data: MyInterfaceDto[];
};

/**
 * Renders the scrollable list of UI builder projects assigned to the current user.
 */
export const InterfaceList = ({ data: interfaces }: InterfaceListProps) => {
  const { id } = useParams();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, currentIndex: number) => {
    if (!listRef.current) return;

    const rows = Array.from(listRef.current.querySelectorAll('[tabindex="0"]')) as HTMLElement[];

    if (event.key === "ArrowDown") {
      event.preventDefault();
      rows[(currentIndex + 1) % rows.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      rows[(currentIndex - 1 + rows.length) % rows.length]?.focus();
    }
  };

  if (!interfaces.length) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        No interfaces match your search.
      </div>
    );
  }

  return (
    <ScrollArea
      className="flex-1 p-2 [&_[data-radix-scroll-area-viewport]>div]:!block [&_[data-radix-scroll-area-viewport]>div]:!w-full"
      ref={listRef}
    >
      <div className="h-full space-y-1">
        {interfaces.map((uiInterface, index) => (
          <InterfaceListItem
            key={uiInterface.id}
            uiInterface={uiInterface}
            isSelected={uiInterface.id === id}
            onKeyDown={(event) => handleKeyDown(event, index)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
