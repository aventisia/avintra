import { AccountSetupMain } from "@/features/sign-up/components/account-setup/AccountSetupMain";
import { useValidateUserSession } from "@/react-toolkit/hooks/useValidateUserSession";
import { RedirectPage } from "@/react-toolkit/pages/RedirectPage";

import { ChoosePlanMain } from "./ChoosePlanMain";

export const OnBoardingMain = () => {
  // Validate user session
  const { isPending, onBoardingStep } = useValidateUserSession();

  if (isPending) return <RedirectPage className="h-auto p-3" />;

  switch (onBoardingStep) {
    case "account-setup":
      return <AccountSetupMain />;
    case "choose-plan":
      return <ChoosePlanMain />;
    default:
      return <AccountSetupMain />;
  }
};
