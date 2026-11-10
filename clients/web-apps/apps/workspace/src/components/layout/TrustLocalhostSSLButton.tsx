import { ShieldWarningIcon } from "@phosphor-icons/react";
import React from "react";

// Render a button that links to the Swagger UI to trust the localhost SSL certificate
const TrustLocalhostSSLButton: React.FC = () => {
  return (
    <a
      className="flex h-7 w-full items-center justify-center gap-1 rounded-lg bg-bad px-1 text-xs text-bad-foreground"
      href={import.meta.env.VITE_WORKSPACE_API_PATH?.replace("/api", "/swagger")}
    >
      <ShieldWarningIcon className="size-4" />
      Trust localhost SSL
    </a>
  );
};

export default TrustLocalhostSSLButton;
