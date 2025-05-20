import { ErrorPage } from "@aventisia/ui/layout";

import { AppLogo } from "./AppLogo";
import { AppMinimalFooter } from "./AppMinimalFooter";

export const AppErrorPage = () => {
  return (
    <ErrorPage
      appLogo={<AppLogo logoSrc="logo.svg" />}
      minimalFooter={<AppMinimalFooter />}
    />
  );
};
