import { LogoImage, LogoLink, RedirectPage } from "@aventisia/ui/layout";

import { AppMinimalFooter } from "./AppMinimalFooter";

export const AppRedirectPage = () => {
  return (
    <RedirectPage
      appLogo={
        <LogoLink>
          <LogoImage className="h-7" src="logo.svg" />
        </LogoLink>
      }
      minimalFooter={<AppMinimalFooter />}
    />
  );
};
