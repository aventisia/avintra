import { Loader2Icon } from "lucide-react";

const PdfLoaderTemplate = () => {
  return (
    <div className="col-span-2 overflow-hidden rounded-lg border bg-surface">
      <div className="flex cols-span-2 items-center justify-center p-4 w-full rounded-lg border bg-surface h-full">
        <div className="mt-7 flex flex-col items-center gap-2">
          <Loader2Icon className="h-10 w-10 animate-spin text-muted-foreground" />
          <h3 className="text-lg font-medium text-ink">Loading PDF</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your document
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfLoaderTemplate;
