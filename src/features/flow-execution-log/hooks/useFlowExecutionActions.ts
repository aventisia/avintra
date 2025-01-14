import { toast } from "sonner";

interface FELInputOutput {
  jsonData: string;
  title: string;
}
export const useFlowExecutionActions = ({
  jsonData,
  title,
}: FELInputOutput) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    toast.info("Copied to clipboard");
  };
  const handleDownloadFile = (fileUrl: string, ext = "") => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${title}${ext}`;
    link.click();
    URL.revokeObjectURL(fileUrl);
  };
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    handleDownloadFile(url);
  };

  return { handleCopy, handleDownload };
};
