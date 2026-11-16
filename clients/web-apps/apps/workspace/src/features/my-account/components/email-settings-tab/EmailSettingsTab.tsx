import { useEffect } from "react";

import { useProfileEmailUpdateStore } from "../../stores/profile-email-update-store";
import type { AccountTabProps } from "../../types/account-tab.type";
import { EnterEmail } from "./EnterEmail";
import { VerifyEmail } from "./VerifyEmail";

export const EmailSettingsTab = ({ footerSlot }: AccountTabProps) => {
  const stepNo = useProfileEmailUpdateStore((state) => state.stepNo);

  useEffect(
    () => () =>
      useProfileEmailUpdateStore.setState({
        stepNo: 1,
        updateProfileEmailData: null,
        verifyEmailData: null,
      }),
    [],
  );

  return stepNo === 2 ? (
    <VerifyEmail footerSlot={footerSlot} />
  ) : (
    <EnterEmail footerSlot={footerSlot} />
  );
};
