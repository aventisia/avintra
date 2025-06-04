/**
 * Custom hook to handle opening the /run-review URL with preserved query params and an added `fid`.
 *
 * @returns A function to handle opening the model
 */
export const useOpenRunReviewRecord = () => {
  

    const handleOpenRunReviewAction = () => {
      const currentUrl = new URL(window.location.href);
  
      // Force pathname to /run-review
      currentUrl.pathname = "/run-review-view";
  
      // Open in new tab
      window.open(currentUrl.toString(), "_blank");
    };
  
    return handleOpenRunReviewAction;
  };
  