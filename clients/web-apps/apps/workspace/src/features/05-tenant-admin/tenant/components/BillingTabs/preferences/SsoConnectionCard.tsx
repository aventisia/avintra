import { Button } from "@avplatform/ui/buttons";

import TabLoader from "../TabLoader";
import { useSsoConnectionCard } from "./hooks/useSsoConnectionCard";

const SsoConnectionCard = () => {
  const {
    isLoading,
    isConnected,
    emailDomain,
    isSSOEnabled,
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
    </section>
  );
};

export default SsoConnectionCard;
