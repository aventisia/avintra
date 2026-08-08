import { Input, LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import Lucide from "@avplatform/ui/components/Lucide";
import { useEffect, useState } from "react";

import { SetupCard } from "./components/SetupCard";

const LS_BASE_URL_KEY = "aventisia:baseUrl";

interface ServiceUrlPageProps {
  onContinue: (appBaseUrl: string) => void;
}

export default function ServiceUrlPage({ onContinue }: ServiceUrlPageProps) {
  const [serviceUrl, setServiceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem(LS_BASE_URL_KEY) || import.meta.env.VITE_BASE_URL;
    if (savedUrl) setServiceUrl(savedUrl);
  }, []);

  const validateBaseUrl = (value: string): string | null => {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") {
        return "Please enter a valid HTTPS service URL.";
      }

      //TODO: Add global admin api check to validate domain
      // if (!url.hostname.includes("aventisia")) {
      //   return "Please enter a URL for a valid Avintra instance..";
      // }
      return null;
    } catch {
      return "Please enter a valid service URL.";
    }
  };

  const handleContinue = () => {
    const raw = serviceUrl.trim();

    let originOnly: string;
    try {
      const url = new URL(raw);
      originOnly = url.origin; // to trim ( /path,  query)
    } catch {
      setError("Please enter a valid service URL.");
      return;
    }

    const validationError = validateBaseUrl(originOnly);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    localStorage.setItem(LS_BASE_URL_KEY, originOnly);

    onContinue(originOnly);
  };

  return (
    <SetupCard
      title="Connect to Avintra"
      subtitle="Use the default Aventisia service, or provide a URL for a self-hosted instance."
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Input
            id="service-url-input"
            type="url"
            autoFocus
            value={serviceUrl}
            disabled={isLoading}
            className="h-11 text-md"
            placeholder="https://avintra.aventisia.com"
            onChange={(e) => {
              setServiceUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          />
          {error && <span className="text-xs mt-1 ml-0.5 text-destructive">{error}</span>}
        </div>

        <Button className="w-full h-11 text-md" onClick={handleContinue} disabled={isLoading}>
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner className="h-4 w-4 text-primary-foreground" />
              Connecting...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              Continue
              <Lucide icon="ArrowRight" className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </SetupCard>
  );
}
