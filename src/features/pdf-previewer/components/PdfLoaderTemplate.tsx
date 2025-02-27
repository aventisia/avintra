import { Loader2Icon } from "lucide-react";

const PdfLoaderTemplate = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="mt-7 flex flex-col items-center gap-2">
        <Loader2Icon className="h-10 w-10 animate-spin text-slate-600" />
        <h3 className="text-lg font-medium text-slate-900">Loading PDF</h3>
        <p className="text-sm text-slate-500">
          Please wait while we prepare your document
        </p>
      </div>
    </div>
  );
};

export default PdfLoaderTemplate;
