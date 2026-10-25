import { Button } from "@avplatform/ui/buttons";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Landing page for the OAuth popup after the Corsair sidecar redirects back
 * from the provider. Reads the result from query params, shows a clear
 * message, and attempts to notify the opener window so the vault can stop
 * polling and refresh the credentials list.
 */
export const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();

  const success = searchParams.has("oauth_success");
  const cancelled = searchParams.has("oauth_cancelled");
  const error = searchParams.get("oauth_error");
  const plugin = searchParams.get("plugin") ?? "unknown";
  const credentialId = searchParams.get("credentialId") ?? "";

  const message = useMemo(() => {
    if (error) return error;
    if (cancelled) return "OAuth consent was cancelled.";
    if (success) return `Connected to ${plugin}.`;
    return "OAuth callback completed.";
  }, [cancelled, error, plugin, success]);

  useEffect(() => {
    // Notify the parent/opener window so it can stop polling and refresh state.
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        {
          type: "OAUTH_CALLBACK",
          success,
          cancelled,
          error,
          plugin,
          credentialId,
        },
        window.location.origin,
      );
    }
  }, [cancelled, credentialId, error, plugin, success]);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          {success ? (
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          ) : (
            <XCircle className="h-12 w-12 text-red-600" />
          )}
          <h1 className="text-xl font-semibold">
            {success ? "Connection successful" : "Connection failed"}
          </h1>
          <p className="text-muted-foreground text-sm">{message}</p>
          {credentialId && (
            <p className="text-muted-foreground text-xs">Credential: {credentialId}</p>
          )}
          <Button onClick={handleClose} className="mt-2 w-full">
            Close window
          </Button>
        </div>
      </div>
    </div>
  );
};
