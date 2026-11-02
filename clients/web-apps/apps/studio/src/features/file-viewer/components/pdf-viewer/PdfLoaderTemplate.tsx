import { Loader2Icon } from "lucide-react";

const PdfLoaderTemplate = () => {
  return (
    <div className="col-span-2 overflow-hidden rounded-lg border border-line bg-surface shadow-pop">
      <div className="flex cols-span-2 items-center justify-center p-4 w-full rounded-lg border border-line bg-surface h-full">
        <div className="mt-7 flex flex-col items-center gap-2">
          <Loader2Icon className="h-10 w-10 animate-spin text-muted-foreground" />
          <h3 className="text-heading text-ink">Loading PDF</h3>
          <p className="text-body-sm text-muted-foreground">
            Please wait while we prepare your document
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfLoaderTemplate;
