import { ShieldQuestionIcon } from "lucide-react";
import React from "react";

// Render a button that links to the Swagger UI to trust the localhost SSL certificate
const TrustLocalhostSSLButton: React.FC = () => {
  return (
    <a
      className="flex h-7 w-full items-center justify-center gap-1 rounded-lg bg-destructive px-1 text-xs text-destructive-foreground"
      href={import.meta.env.VITE_WORKSPACE_API_PATH?.replace("/api", "/swagger")}
    >
      <ShieldQuestionIcon className="size-4 stroke-[1.6]" />
      Trust Localhost SSL
    </a>
  );
};

export default TrustLocalhostSSLButton;
