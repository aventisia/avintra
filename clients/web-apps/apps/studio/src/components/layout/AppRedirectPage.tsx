import { RedirectPage } from "@avplatform/layout";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";

import { AppLogo } from "./AppLogo";

export const AppRedirectPage = () => {
  return (
    <RedirectPage
      appLogo={<AppLogo className="h-7" showFullLogo />}
      minimalFooter={<MinimalFooter />}
    />
  );
};
