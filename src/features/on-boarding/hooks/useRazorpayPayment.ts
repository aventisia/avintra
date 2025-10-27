import { toast } from "@aventisia/ui/sonner";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useChoosePlanStore } from "../stores/choose-plan-store";
import {
  RazorpayErrorResponse,
  RazorpaySuccessResponse,
} from "../types/razorpay";

export const useRazorpayPayment = () => {
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  const { setPaymentId } = useChoosePlanStore(
    useShallow((state) => ({
      setPaymentId: state.setPaymentId,
    })),
  );
  // Load Razorpay script and check readiness
  useEffect(() => {
    // Check if Razorpay script is already loaded
    if (
      document.querySelector(
        `script[src="https://checkout.razorpay.com/v1/checkout.js"]`,
      )
    ) {
      setIsRazorpayReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayReady(true);
    script.onerror = () => console.warn("Failed to load Razorpay script");
    document.body.appendChild(script);
  }, []);

  // Function to open Razorpay checkout
  const openRazorpayPayment = (subscriptionId: string) => {
    if (!isRazorpayReady) return;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      subscription_id: subscriptionId,
      name: "Aventisia Technologies Pvt Ltd",
      description: "Subscription Payment",
      image: "/logo_icon.jpg",

      handler: function (response: RazorpaySuccessResponse) {
        setPaymentId(response.razorpay_payment_id);
        localStorage.setItem("payment_id", response.razorpay_payment_id);
      },

      theme: {
        color: "#0f172a",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

    razorpay.on("payment.failed", function (response: RazorpayErrorResponse) {
      toast.error("Payment failed: " + response.error.description);
    });
  };

  return { isRazorpayReady, openRazorpayPayment };
};
