import { ShieldQuestionIcon } from "lucide-react";
import React from "react";

// Render a button that links to the Swagger UI to trust the localhost SSL certificate
const TrustLocalhostSSLButton: React.FC = () => {
  return (
    <a
      className="flex h-7 gap-1 w-full items-center justify-center rounded-lg bg-destructive px-1 text-xs text-white"
      href={import.meta.env.VITE_WORC_API_URL?.replace("/api", "/swagger")}
    >
      <ShieldQuestionIcon className="size-4 stroke-[1.6]" />
      Trust Localhost SSL
    </a>
  );
};

export default TrustLocalhostSSLButton;
