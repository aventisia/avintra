import { RedirectPage } from "@aventisia/ui/layout";

import { AppLogo } from "./AppLogo";
import { AppMinimalFooter } from "./AppMinimalFooter";

export const AppRedirectPage = () => {
  return (
    <RedirectPage
      appLogo={<AppLogo logoSrc="/logo.svg" />}
      minimalFooter={<AppMinimalFooter />}
    />
  );
};
