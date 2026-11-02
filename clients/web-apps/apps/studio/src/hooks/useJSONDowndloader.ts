/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "@avplatform/ui/sonner";
import { useCallback, useState } from "react";

// Type for the hook's return value
interface UseJsonDownloadProps {
  downloadJson: (data: any, filename?: string) => void;
  isDownloading: boolean;
}

// Optional: More specific type for JSON data
type JsonData = Record<string, any> | any[] | string | number | boolean | null;

// Custom hook for downloading JSON data
export const useJsonDownload = (): UseJsonDownloadProps => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const downloadJson = useCallback((data: JsonData, filename: string = "data.json"): void => {
    try {
      setIsDownloading(true);

      // Convert JSON data to string with formatting
      const jsonString: string = JSON.stringify(data, null, 2);

      // Create a Blob with the JSON data
      const blob: Blob = new Blob([jsonString], { type: "application/json" });

      // Create a temporary URL for the blob
      const url: string = URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link: HTMLAnchorElement = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Exported successfully");
    } catch (error: unknown) {
      console.error("Error downloading JSON:", error);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { downloadJson, isDownloading };
};
