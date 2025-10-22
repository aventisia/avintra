import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { RazorpayErrorResponse } from "../types/razorpay";

export const useRazorpayPayment = () => {
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const navigate = useNavigate();

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

      handler: function () {
        // Payment Success
        localStorage.clear();
        navigate("/redirect?url=" + import.meta.env.VITE_WORC_URL);
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
