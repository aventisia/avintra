import { Loader2Icon } from "lucide-react";

const PdfLoaderTemplate = () => {
  return (
    <div className="col-span-2 overflow-hidden rounded-lg border bg-white shadow">
      <div className="flex cols-span-2 items-center justify-center p-4 w-full rounded-lg border bg-white h-full">
        <div className="mt-7 flex flex-col items-center gap-2">
          <Loader2Icon className="h-10 w-10 animate-spin text-slate-600" />
          <h3 className="text-lg font-medium text-slate-900">Loading PDF</h3>
          <p className="text-sm text-slate-500">
            Please wait while we prepare your document
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfLoaderTemplate;
