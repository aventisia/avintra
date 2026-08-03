import { Input } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { usePageControls } from "../../stores/pdf-previewer-store";

const PageControl = () => {
  const {
    numPages,
    pageNumber,
    setPageNumber,
    goToPreviousPage,
    goToNextPage,
    isFirstPage,
    isLastPage,
  } = usePageControls();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10);
    if (!isNaN(raw)) setPageNumber(raw); // store clamps automatically
  };

  // Prevent non-numeric keys for cleaner UX
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = [
      "Backspace",
      "Tab",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Enter",
    ];
    if (!/^\d$/.test(e.key) && !allowed.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex items-center flex-1 gap-0.5" role="group" aria-label="Page navigation">
      <Button
        variant="ghost"
        size="icon7"
        onClick={goToPreviousPage}
        disabled={isFirstPage}
        title="Previous page"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Input
          type="number"
          min={1}
          max={numPages ?? 1}
          value={pageNumber}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="h-6 w-10 rounded border bg-transparent px-0 text-center text-xs [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={`Page ${pageNumber} of ${numPages ?? "unknown"}`}
        />
        <span className="select-none">/ {numPages ?? "—"}</span>
      </div>

      <Button
        variant="ghost"
        size="icon7"
        onClick={goToNextPage}
        disabled={isLastPage}
        title="Next page"
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PageControl;
