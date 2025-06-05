import { toast } from "@aventisia/ui/sonner";

/**
 * Custom hook to handle opening the /run-review URL with preserved query params and an added `fid`.
 *
 * @returns A function to handle opening the model
 */
export const useOpenRunReviewRecord = () => {
    const handleOpenRunReviewAction = (fileId: string) => {
      if(!fileId) {
        return toast.error("Failed to open record. Please try again")
      }

      const currentUrl = new URL(window.location.href);

      // Force pathname to /run-review
      currentUrl.pathname = "/preview";

      currentUrl.searchParams.set("fid", fileId)
      currentUrl.searchParams.set("source", "run-reveiew");
  
      // Open in new tab
      window.open(currentUrl.toString(), "_blank");
    };
  
    return handleOpenRunReviewAction;
  };
  