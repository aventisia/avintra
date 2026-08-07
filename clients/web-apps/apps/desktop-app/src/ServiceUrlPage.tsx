import { Input } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

const LS_BASE_URL_KEY = "aventisia:baseUrl";

/** True when running inside the Tauri webview (IPC available). */
const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export default function ServiceUrlPage() {
  const [serviceUrl, setServiceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem(LS_BASE_URL_KEY) || import.meta.env.VITE_BASE_URL;
    if (savedUrl) setServiceUrl(savedUrl);
  }, []);

  // On first launch, ensure the DesktopRunner is downloaded and extracted into
  // the versioned desktop-executor folder. The base URL is the origin (e.g.
  // https://avdev.aventisia.com); the backend appends /accounts/api internally.
  useEffect(() => {
    if (!serviceUrl || !isTauri()) return;
    const origin = new URL(serviceUrl).origin;
    invoke("ensure_desktop_executor", { appBaseUrl: origin }).catch((err) => {
      console.error("Failed to provision DesktopRunner:", err);
    });
  }, [serviceUrl]);

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

    setTimeout(() => {
      window.location.href = `${originOnly}/accounts/login`;
    }, 300);
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 p-6">
      <div className="z-10 flex w-full max-w-md flex-col gap-8 rounded-[1.25rem] border border-border bg-card p-12 shadow-[0_10px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="flex justify-start">
          <img src="/logo.svg" alt="Aventisia" className="h-8" />
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <h2 className="text-4xl font-medium text-foreground">Connect to Avintra</h2>
          <p className="ml-0.5 text-sm font-medium text-muted-foreground">
            Enter the Service URL to continue.
          </p>
        </div>

        <div className="-mt-2 mb-6">
          <Input
            id="service-url-input"
            type="url"
            autoFocus
            value={serviceUrl}
            disabled={isLoading}
            placeholder="https://avintra.aventisia.com"
            onChange={(e) => {
              setServiceUrl(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          />

          {error ? (
            <div className="mt-2.5 pl-1 text-[0.8125rem] leading-relaxed text-destructive">
              <span>{error}</span>
            </div>
          ) : (
            <div className="mt-2.5 pl-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
              Use the default Aventisia service, or provide a URL for a self-hosted instance.
            </div>
          )}

          <Button className="mt-7 w-full" onClick={handleContinue} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-primary-foreground" />
                Connecting...
              </>
            ) : (
              <>
                Continue
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 3L11 8L6 13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
