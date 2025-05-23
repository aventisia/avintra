import { ErrorPage } from "@aventisia/ui/layout";

import { AppLogo } from "@/react-toolkit/layout/AppLogo";
import { AppMinimalFooter } from "./AppMinimalFooter";

export const AppErrorPage = () => {
  return (
    <ErrorPage appLogo={<AppLogo />} minimalFooter={<AppMinimalFooter />} />
  );
};
