import { ErrorPage } from "@avplatform/layout";
import { useEffect } from "react";
import { useRouteError } from "react-router-dom";

import { AppLogo } from "./AppLogo";
import { AppMinimalFooter } from "./AppMinimalFooter";

export const AppErrorPage = () => {
  // Get the error object
  const error = useRouteError() as {
    message: string;
    status?: number;
    statusText?: string;
  };

  useEffect(() => {
    if (
      error?.message?.includes("Failed to fetch dynamically imported module")
    ) {
      window.location.reload();
    }
  }, [error?.message]);

  return (
    <ErrorPage
      appLogo={<AppLogo logoSrc="/logo.svg" />}
      minimalFooter={<AppMinimalFooter />}
    />
  );
};
