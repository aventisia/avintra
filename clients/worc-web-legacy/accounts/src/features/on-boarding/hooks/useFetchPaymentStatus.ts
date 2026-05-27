import { toast } from "@aventisia/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getPaymentStatus } from "../apis/payment-status-apis";
import { useChoosePlanStore } from "../stores/choose-plan-store";

/**
 * Custom React hook to track and fetch Razorpay payment status using React Query.
 *
 * This hook uses React Query to fetch the payment status and checks the status every 5 seconds
 * until all required payment statuses are completed. The checking behavior is managed using the `refetchInterval`
 * configuration in React Query, which is controlled by the current status of the payment.
 *
 * Features:
 * - Checks the payment status every 5 seconds until all statuses are `true`.
 * - Uses React Query's `refetchInterval` to control the checking behavior.
 * - Stops checking once all statuses are completed.
 * - Displays a toast notification on any error during fetching.
 *
 * - The unique Razorpay payment ID to track.
 *
 * @returns An object containing:
 * - `data`: The latest {@link PaymentStatusDto} object with current payment status.
 * - `isFetching`: Whether a background check is currently in progress.
 * - `isLoading`: Whether the initial load is still in progress.
 * - `refetch`: Function to manually trigger a re-check.
 */
export const useFetchPaymentStatus = () => {
  const { paymentId } = useChoosePlanStore(
    useShallow((state) => ({ paymentId: state.paymentId })),
  );

  // State to manage whether checking should continue
  const [shouldCheck, setShouldCheck] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  const { data, isFetching, isLoading, refetch, isError, error } = useQuery({
    queryKey: ["PAYMENT_STATUS", paymentId],
    queryFn: () => getPaymentStatus(paymentId),
    enabled: Boolean(paymentId), // only run if paymentId is available
    refetchInterval: shouldCheck ? 5000 : false, // Check every 5 seconds until statuses are complete
    staleTime: 0, // always treat data as fresh for each check
    refetchOnWindowFocus: false, // prevent unnecessary extra checks
  });

  // Check if all statuses are complete, and stop checking if so
  useEffect(() => {
    if (data) {
      const allStatusesCompleted =
        data.data.isInitiated &&
        data.data.isCollected &&
        data.data.isBillingCreated &&
        data.data.isSubscribed &&
        data.data.isCreditUpdated;

      // Stop checking if all statuses are completed
      setShouldCheck(!allStatusesCompleted);

      if (allStatusesCompleted) {
        setShowRedirectMessage(true);

        let countdownValue = 3;
        const countdownInterval = setInterval(() => {
          setCountdown(countdownValue);
          countdownValue -= 1;

          if (countdownValue < 0) {
            clearInterval(countdownInterval);
            localStorage.clear(); // Clear payment info from LS

            setTimeout(() => {
              window.location.assign(
                import.meta.env.VITE_WORKSPACE_PATH + "tenant",
              );
            }, 500); // Delay for a smooth transition
          }
        }, 1000); // Update every second
      }
    }
  }, [data]);

  // Show toast on fetch error
  useEffect(() => {
    if (isError && error) toast.error(error.toString());
  }, [error, isError]);

  return {
    data,
    isFetching,
    isLoading,
    refetch,
    paymentCompleted: !shouldCheck,
    paymentId,
    showRedirectMessage,
    countdown,
  };
};
