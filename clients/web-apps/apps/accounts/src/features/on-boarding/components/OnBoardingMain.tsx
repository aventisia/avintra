import { useValidateUserSession } from "@/hooks/useValidateUserSession";
import { RedirectPage } from "@/pages/default-pages";

import { useFetchPaymentStatus } from "../hooks/useFetchPaymentStatus";
import { Checkout } from "./checkout/Checkout";
import { PaymentProcessingLoader } from "./checkout/PaymentProcessingLoader";

export const OnBoardingMain = () => {
  // Validate user session
  const { isPending, hasActiveSubscription } = useValidateUserSession();
  const { data, paymentId, countdown, showRedirectMessage } = useFetchPaymentStatus();

  if (isPending) return <RedirectPage />;

  if (paymentId)
    return (
      <PaymentProcessingLoader
        status={data?.data}
        countdown={countdown}
        showRedirectMessage={showRedirectMessage}
      />
    );

  return <Checkout hasActiveSubscription={hasActiveSubscription} />;
};
