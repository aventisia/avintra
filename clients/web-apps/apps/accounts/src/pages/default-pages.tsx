import {
  ErrorPage as BaseErrorPage,
  NotFoundWithLayoutPage as BaseNotFoundWithLayoutPage,
  RedirectPage as BaseRedirectPage,
} from "@avplatform/layout/default-pages";
import { AppLogo } from "@avplatform/layout/logo";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";

const appLogo = <AppLogo showFullLogo={true} className="h-7" />;
const minimalFooter = <MinimalFooter />;

const ErrorPage = () => <BaseErrorPage appLogo={appLogo} minimalFooter={minimalFooter} />;

const NotFoundWithLayoutPage = () => (
  <BaseNotFoundWithLayoutPage appLogo={appLogo} minimalFooter={minimalFooter} />
);

const RedirectPage = ({ className }: { className?: string }) => (
  <BaseRedirectPage appLogo={appLogo} minimalFooter={minimalFooter} className={className} />
);

export { ErrorPage, NotFoundWithLayoutPage, RedirectPage };
