import { AppLogo } from "@avplatform/layout/logo";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";
import { LoadingSpinner } from "@avplatform/ui";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { useValidateEntraTokenMutation } from "./useValidateEntraTokenMutation";

export const SsoRedirectMain = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  const { validateEntraTokenMutation } = useValidateEntraTokenMutation();

  useEffect(() => {
    if (code) {
      validateEntraTokenMutation(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-between p-3 pb-3 lg:w-[100%]">
      <div className="flex w-full items-center justify-between p-5 xs:p-6">
        <AppLogo showFullLogo={true} className="h-7" />
      </div>
      <div className="-mt-4 flex items-center gap-4 text-md">
        <LoadingSpinner className="size-7 text-primary" />
        Logging you in...
      </div>
      <MinimalFooter />
    </div>
  );
};
