import { toast } from "@avplatform/ui/sonner";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUpgradePlanDialogStore } from "../store/overview/upgrade-plan-dialog.store.ee";
import {
  RazorpayErrorResponse,
  RazorpayOptions,
  RazorpaySuccessResponse,
} from "../types/razorpay.ee";

export const useRazorpayPayment = () => {
  // State to track if Razorpay script has finished loading
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  const { setPaymentId } = useUpgradePlanDialogStore(
    useShallow((state) => ({ setPaymentId: state.setPaymentId })),
  );

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    // Check if the Razorpay script is already present on the page
    if (document.querySelector(`script[src="https://checkout.razorpay.com/v1/checkout.js"]`)) {
      // If already loaded, set Razorpay as ready
      setIsRazorpayReady(true);
      return;
    }

    // Create a new script element for Razorpay checkout
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    // When script is loaded, set Razorpay as ready
    script.onload = () => setIsRazorpayReady(true);

    // Handle error loading script
    script.onerror = () => console.warn("Failed to load Razorpay script");

    // Append the script to the body of the document
    document.body.appendChild(script);
  }, []);

  // Function to initiate Razorpay payment checkout
  const openRazorpayPayment = ({
    subscriptionId,
    orderId,
    onSuccess, // Custom success callback
    onFailure, // Custom failure callback
  }: {
    subscriptionId?: string;
    orderId?: string;
    onSuccess?: (response: RazorpaySuccessResponse) => void;
    onFailure?: (error: RazorpayErrorResponse) => void;
  }) => {
    // If Razorpay is not ready, do not proceed
    if (!isRazorpayReady) return;

    // Default options for Razorpay payment
    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Razorpay Key
      name: "Aventisia Technologies Pvt Ltd", // Business name
      description: "Subscription Payment", // Description of the payment
      image: "/logo_icon.jpg", // Image/logo to show in payment window
      handler: function (response: RazorpaySuccessResponse) {
        setPaymentId(response.razorpay_payment_id);
        localStorage.setItem("payment_id", response.razorpay_payment_id);

        // Custom success handler
        if (onSuccess) {
          onSuccess(response); // Trigger custom success callback
        }
      },
      theme: {
        color: "#0f172a", // Customize payment window theme color
      },
    };

    // Use subscriptionId in case of subscription plan and orderId in case of top-up
    if (subscriptionId) {
      options.subscription_id = subscriptionId;
    } else if (orderId) {
      options.order_id = orderId;
    }

    // Create Razorpay instance with provided options
    const razorpay = new window.Razorpay(options);

    // Open Razorpay payment window
    razorpay.open();

    // Handle payment failure
    razorpay.on("payment.failed", function (response: RazorpayErrorResponse) {
      // Show error message using toast notification
      toast.error("Payment failed: " + response.error.description);

      // Trigger custom failure callback if provided
      if (onFailure) {
        onFailure(response); // Pass error response to failure callback
      }
    });
  };

  // Return the state and function to interact with Razorpay
  return { isRazorpayReady, openRazorpayPayment };
};
