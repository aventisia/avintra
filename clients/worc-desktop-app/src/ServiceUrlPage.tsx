import { useEffect, useState } from "react";

const LS_BASE_URL_KEY = "aventisia:baseUrl";

export default function ServiceUrlPage() {
  const [serviceUrl, setServiceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUrl =
      localStorage.getItem(LS_BASE_URL_KEY) || import.meta.env.VITE_BASE_URL;
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

    setTimeout(() => {
      window.location.href = `${originOnly}/accounts/login`;
    }, 300);
  };

  return (
    <main className="service-url-root">
      <div className="service-url-card">
        <div className="service-url-logo">
          <img src="/logo.svg" alt="Aventisia" />
        </div>
        <div className="service-url-title">
          <h2>Connect to Avintra</h2>
          <p>Enter the Service URL to continue.</p>
        </div>

        <div className="service-url-form">
          <div className="service-url-input-wrapper">
            <input
              id="service-url-input"
              type="url"
              autoFocus
              className={`ui-input `}
              value={serviceUrl}
              disabled={isLoading}
              placeholder="https://avintra.aventisia.com"
              onChange={(e) => {
                setServiceUrl(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            />
          </div>

          {error ? (
            <div className="service-url-error">
              <span>{error}</span>
            </div>
          ) : (
            <div className="service-url-helper">
              Use the default Aventisia service, or provide a URL for a
              self-hosted instance.
            </div>
          )}

          <button
            className="ui-button service-url-cta"
            onClick={handleContinue}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="service-url-spinner" />
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
          </button>
        </div>
      </div>
    </main>
  );
}
