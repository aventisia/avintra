// import { useMemo } from "react";
// import { useSearchParams } from "react-router-dom";

// /**
//  * Builds Work Item details URL from current My Queue context.
//  *
//  * - Reads selected queueId from query param (qid)
//  * - Returns a stable function to generate Work Item URLs
//  */
// export const useOpenWorkItem = () => {
//   const [searchParams] = useSearchParams();
//   const queueId = searchParams.get("qid");

//   const getWorkItemUrl = useMemo(() => {
//     return (workItemId: string) => {
//       if (!queueId) {
//         // Fail fast – Work Item page needs queue context
//         console.warn("useOpenWorkItem: queueId not found in URL");
//         return "";
//       }

//       return `/assist/my-queue/${queueId}/work-items/${workItemId}`;
//     };
//   }, [queueId]);

//   return {
//     queueId,
//     getWorkItemUrl,
//   };
// };

// hooks/useOpenWorkItem.ts
import { useCallback } from "react";
import { useLocation } from "react-router-dom";

export const useOpenWorkItem = () => {
  const location = useLocation();

  const getWorkItemUrl = useCallback(
    (workItemId: string) => {
      const params = new URLSearchParams(location.search);
      params.set("wid", workItemId);

      return `/assist/my-queue?${params.toString()}`;
    },
    [location.search],
  );

  return {
    getWorkItemUrl,
  };
};
