import { RedirectPage } from "@aventisia/ui/layout";

import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { AppMinimalFooter } from "./AppMinimalFooter";

export const AppRedirectPage = () => {
  return (
    <RedirectPage appLogo={<AppLogo />} minimalFooter={<AppMinimalFooter />} />
  );
};
