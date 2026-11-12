import { AppLogo } from "@avplatform/layout/logo";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";
import { LoadingSpinner } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon, ConfettiIcon } from "@phosphor-icons/react";

import type { PaymentStatusDto } from "../../dtos/payment-status-dto";

const STEPS: { key: keyof PaymentStatusDto; label: string }[] = [
  { key: "isCollected", label: "Payment received" },
  { key: "isBillingCreated", label: "Invoice generated" },
  { key: "isSubscribed", label: "Plan activated" },
  { key: "isCreditUpdated", label: "Credits added" },
];

const PaymentProcessingLoader = ({
  status,
  showRedirectMessage,
  countdown,
}: {
  status?: PaymentStatusDto;
  showRedirectMessage: boolean;
  countdown: number;
}) => {
  const activeIndex = STEPS.findIndex((step) => !status?.[step.key]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <AppLogo showFullLogo={true} className="h-7" />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <div
            className={cn(
              "mx-auto flex h-14 w-14 items-center justify-center rounded-full",
              showRedirectMessage
                ? "bg-emerald-100 text-emerald-600"
                : "bg-primary/10 text-primary",
            )}
          >
            {showRedirectMessage ? (
              <ConfettiIcon className="h-7 w-7" />
            ) : (
              <LoadingSpinner className="h-7 w-7" />
            )}
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            {showRedirectMessage ? "You're all set!" : "Confirming your payment"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {showRedirectMessage
              ? `Taking you to your workspace${countdown > 0 ? ` in ${countdown}s` : ""}...`
              : "This usually takes a few seconds. Please keep this page open."}
          </p>

          <ol className="mt-7 space-y-3 text-left">
            {STEPS.map((step, index) => {
              const isDone = !!status?.[step.key];
              const isActive = index === activeIndex;
              return (
                <li key={step.key} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                      isDone && "border-emerald-600 bg-emerald-600 text-white",
                      isActive && "border-primary text-primary",
                    )}
                  >
                    {isDone ? (
                      <CheckIcon weight="bold" className="h-3.5 w-3.5" />
                    ) : isActive ? (
                      <LoadingSpinner className="h-3.5 w-3.5" />
                    ) : null}
                  </span>
                  <span className={cn(!isDone && !isActive && "text-muted-foreground")}>
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export { PaymentProcessingLoader };
