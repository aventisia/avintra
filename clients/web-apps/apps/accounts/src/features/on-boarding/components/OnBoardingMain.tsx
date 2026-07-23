import { AccountSetupMain } from "@/features/on-boarding/components/account-setup/AccountSetupMain";
import { useValidateUserSession } from "@/hooks/useValidateUserSession";
import { RedirectPage } from "@/pages/default-pages";

import { useFetchPaymentStatus } from "../hooks/useFetchPaymentStatus";
import { ChoosePlanMain } from "./ChoosePlanMain";
import { PaymentProcessingLoader } from "./choose-plan/PaymentProcessingLoader";

export const OnBoardingMain = () => {
  // Validate user session
  const { isPending, onBoardingStep } = useValidateUserSession();
  const { paymentId, countdown, showRedirectMessage } = useFetchPaymentStatus();

  if (isPending) return <RedirectPage />;

  if (paymentId)
    return (
      <PaymentProcessingLoader countdown={countdown} showRedirectMessage={showRedirectMessage} />
    );

  switch (onBoardingStep) {
    case "account-setup":
      return <AccountSetupMain />;
    case "choose-plan":
      return <ChoosePlanMain />;
    default:
      return <AccountSetupMain />;
  }
};
