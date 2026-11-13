import { toast } from "@avplatform/ui/sonner";
import { downloadJsonFile } from "@avplatform/ui/utils";
import { useCallback } from "react";

/** Downloads JSON data as a file. */
export const useJsonDownload = () => {
  const downloadJson = useCallback((data: unknown, filename: string = "data.json") => {
    try {
      downloadJsonFile(data, filename);
      toast.success(`Exported ${filename}`);
    } catch (error: unknown) {
      console.error("Error downloading JSON:", error);
    }
  }, []);

  return { downloadJson };
};
