import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { recordLabelClass } from "@avplatform/ui/record-sheet";
import { useUserSessionStore } from "@avplatform/ui/stores";
import type { IconProps } from "@avplatform/ui/types";
import {
  ArrowRightIcon,
  BuildingsIcon,
  CloudCheckIcon,
  CodeIcon,
  HardDrivesIcon,
  KeyIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  StackIcon,
  VaultIcon,
} from "@phosphor-icons/react";
import type { ComponentType, ReactNode } from "react";
import { useShallow } from "zustand/react/shallow";

import { useUpgradePlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/upgrade-plan-dialog.store.ee";

type Feature = { Icon: ComponentType<IconProps>; title: string; detail: string };

const SELF_HOSTED_FEATURES: Feature[] = [
  {
    Icon: HardDrivesIcon,
    title: "Host on your infrastructure",
    detail:
      "Deploy Avintra securely within your private cloud or on-premise setup for complete control.",
  },
  {
    Icon: VaultIcon,
    title: "Bring your own key vault",
    detail:
      "Integrate seamlessly with your existing key vault for secure credential and secret management.",
  },
  {
    Icon: KeyIcon,
    title: "Connect via your API keys",
    detail:
      "Securely integrate with your internal or third-party systems using your own API credentials.",
  },
  {
    Icon: StackIcon,
    title: "Full environment separation",
    detail:
      "Includes dedicated Dev, Staging, and Production environments to support enterprise-grade CI/CD and governance.",
  },
];

const CLOUD_FEATURES: Feature[] = [
  {
    Icon: CloudCheckIcon,
    title: "Fully managed by Aventisia",
    detail: "Skip the infrastructure hassle — we host, monitor, and manage everything for you.",
  },
  {
    Icon: ShieldCheckIcon,
    title: "Secure key management",
    detail:
      "Use Aventisia’s multi-tenant key vault, or integrate your own for managing credentials securely.",
  },
  {
    Icon: CodeIcon,
    title: "Use built-in APIs",
    detail:
      "Access Avintra's powerful APIs for seamless integration with your applications and workflows.",
  },
  {
    Icon: StackIcon,
    title: "Integrated environments",
    detail:
      "Dev, Staging, and Production environments come pre-configured for faster deployment and testing cycles.",
  },
];

type DeploymentCardProps = {
  Icon: ComponentType<IconProps>;
  eyebrow: string;
  title: string;
  features: Feature[];
  isWide: boolean;
  isFeatured?: boolean;
  action: ReactNode;
};

const DeploymentCard = ({
  Icon,
  eyebrow,
  title,
  features,
  isWide,
  isFeatured = false,
  action,
}: DeploymentCardProps) => (
  <article
    className={cn(
      "relative isolate flex flex-col overflow-hidden rounded-lg bg-surface ring-1",
      isFeatured ? "ring-primary/40" : "ring-line",
      isWide && "md:col-span-2",
    )}
  >
    {isFeatured && (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-primary/[0.07] to-transparent"
      />
    )}
    <header className="flex items-center gap-3 px-5 pb-4 pt-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface text-primary-text shadow-sm ring-1 ring-line">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className={recordLabelClass}>{eyebrow}</p>
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      </div>
    </header>
    <ul className={cn("grid flex-1 gap-4 px-5 pb-5", isWide && "sm:grid-cols-2")}>
      {features.map((feature) => (
        <li key={feature.title} className="flex items-start gap-3">
          <IconTile Icon={feature.Icon} size="sm" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-ink">{feature.title}</p>
            <p className="text-[12.5px] leading-5 text-muted-foreground">{feature.detail}</p>
          </div>
        </li>
      ))}
    </ul>
    <div className="border-t border-line bg-sunken/60 px-5 py-3">{action}</div>
  </article>
);

const ChoosePlanOptions = () => {
  const { setOpen, setChosenPlan } = useUpgradePlanDialogStore(
    useShallow((state) => ({
      setChosenPlan: state.setChosenPlan,
      setOpen: state.setOpen,
    })),
  );
  const isStarterPlan = useUserSessionStore((state) => state.userSession?.planType == "Starter");
  const { showCustomAlertDialog } = useShowAlertHandler();

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-ink-2">Pick where Avintra runs for your team.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <DeploymentCard
          Icon={BuildingsIcon}
          eyebrow="Enterprise / commercial"
          title="Self-hosted"
          features={SELF_HOSTED_FEATURES}
          isWide={!isStarterPlan}
          action={
            <Button
              variant="outline"
              className="w-full gap-1.5"
              onClick={() => {
                setOpen(false);
                showCustomAlertDialog({
                  confirmActionFn: () => {},
                  confirmBtnText: "Submit request",
                  description: "Our sales team will get in touch with you shortly.",
                  title: "Enterprise/commercial – self-hosted",
                  isDestructive: false,
                });
              }}
            >
              Talk to sales
              <ArrowRightIcon className="size-4" />
            </Button>
          }
        />
        {isStarterPlan && (
          <DeploymentCard
            Icon={RocketLaunchIcon}
            eyebrow="Pro"
            title="Aventisia multi-tenant cloud"
            features={CLOUD_FEATURES}
            isWide={false}
            isFeatured
            action={
              <Button className="w-full gap-1.5" onClick={() => setChosenPlan("Pro")}>
                Choose Pro
                <ArrowRightIcon className="size-4" />
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default ChoosePlanOptions;
