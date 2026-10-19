import { Button } from "@avplatform/ui/buttons";

import TabLoader from "../TabLoader";
import { useSsoConnectionCard } from "./hooks/useSsoConnectionCard";

const SsoConnectionCard = () => {
  const {
    isLoading,
    isConnected,
    emailDomain,
    isSSOEnabled,
    isSecretPresent,
    isDomainAttested,
    setIsDomainAttested,
    byoClientId,
    setByoClientId,
    byoClientSecret,
    setByoClientSecret,
    saveSsoConfigHandler,
    isSavePending,
    connectHandler,
    isConnectPending,
  } = useSsoConnectionCard();

  if (isLoading) return <TabLoader />;

  return (
    <section className="mb-6 rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Microsoft Entra ID</h3>
          <p className="text-sm text-muted-foreground">
            Let members of your company domain sign in with your organization account.
          </p>
        </div>
        <span
          className={
            isSSOEnabled
              ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
              : "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
          }
        >
          {isSSOEnabled ? "Enabled" : isConnected ? "Connected" : "Not connected"}
        </span>
      </div>

      {isConnected && (
        <dl className="mt-4 grid gap-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Email domain</dt>
            <dd className="font-medium">{emailDomain || "-"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Client credentials</dt>
            <dd className="font-medium">
              {byoClientId ? "Own app registration" : "Platform app"}
              {isSecretPresent ? " (secret stored)" : ""}
            </dd>
          </div>
        </dl>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" onClick={connectHandler} disabled={isConnectPending}>
          {isConnectPending
            ? "Opening Microsoft..."
            : isConnected
              ? "Reconnect with Microsoft Entra ID"
              : "Connect with Microsoft Entra ID"}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">App registration client ID (optional)</span>
          <input
            type="text"
            value={byoClientId}
            onChange={(event) => setByoClientId(event.target.value)}
            placeholder="Optional: use your own Entra app"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">App registration client secret (optional)</span>
          <input
            type="password"
            value={byoClientSecret}
            onChange={(event) => setByoClientSecret(event.target.value)}
            placeholder="Optional: never shown again"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={isDomainAttested}
          onChange={(event) => setIsDomainAttested(event.target.checked)}
          className="mt-0.5 size-4"
        />
        <span>
          I confirm this organization owns <span className="font-medium">{emailDomain || "its email domain"}</span> and
          I am authorized to enable single sign-on for it.
        </span>
      </label>

      <div className="mt-4 flex justify-end">
        <Button type="button" variant="outline" onClick={saveSsoConfigHandler} disabled={isSavePending}>
          {isSavePending ? "Saving" : "Save SSO settings"}
        </Button>
      </div>
    </section>
  );
};

export default SsoConnectionCard;
