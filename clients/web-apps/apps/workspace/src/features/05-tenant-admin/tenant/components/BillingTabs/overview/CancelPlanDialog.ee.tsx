import { IconTile } from "@avplatform/ui/icon-tile";
import { Label } from "@avplatform/ui/label";
import { RadioGroup, RadioGroupItem } from "@avplatform/ui/radio-group";
import { RecordList, RecordListItem, RecordSection } from "@avplatform/ui/record-sheet";
import { useUserSessionStore } from "@avplatform/ui/stores";
import type { IconProps } from "@avplatform/ui/types";
import { formatDate } from "@avplatform/ui/utils";
import {
  ArrowCounterClockwiseIcon,
  CalendarCheckIcon,
  CoinsIcon,
  DownloadSimpleIcon,
  ProhibitIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import type { ComponentType, ReactNode } from "react";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { useCancelPlanDialogStore } from "@/features/05-tenant-admin/tenant/store/overview/cancel-plan-dialog-store.ee";

type Consequence = {
  Icon: ComponentType<IconProps>;
  title: ReactNode;
  detail: string;
  isSevere?: boolean;
};

const getConsequences = (planType: string, expiresOn?: string | Date): Consequence[] => [
  ...(planType === "Starter"
    ? [
        {
          Icon: TrashIcon,
          title: "Your account is deleted immediately",
          detail: "All agents and their data are lost and can’t be recovered.",
          isSevere: true,
        },
        {
          Icon: DownloadSimpleIcon,
          title: "Export what you want to keep first",
          detail: "Download any data you need before you continue.",
        },
      ]
    : []),
  ...(planType === "Pro"
    ? [
        {
          Icon: CalendarCheckIcon,
          title: expiresOn
            ? `Your plan stays active until ${formatDate(expiresOn)}`
            : "Your plan stays active until the end of this billing cycle",
          detail: "Keep using every feature and export your data until then.",
        },
        {
          Icon: TrashIcon,
          title: "Then your account is deleted",
          detail: "All agents and their data are permanently deleted and can’t be recovered.",
          isSevere: true,
        },
      ]
    : []),
  {
    Icon: CoinsIcon,
    title: "Unused top-up credits are forfeited",
    detail: "Even when their expiry date is still in the future.",
  },
  {
    Icon: ArrowCounterClockwiseIcon,
    title: "This can’t be undone",
    detail: "A cancelled plan can’t be restored.",
  },
];

const REASONS = [
  { id: "r1", value: "productQuality", label: "I am not satisfied with the product quality" },
  {
    id: "r2",
    value: "customerSupport",
    label: "I am not satisfied with the customer support/service",
  },
  {
    id: "r3",
    value: "foundAlternativeSolution",
    label: "I found an alternative solution",
    planType: "Starter",
  },
  {
    id: "r3",
    value: "pricing",
    label: "The pricing does not meet my expectations",
    planType: "Pro",
  },
  { id: "r4", value: "others", label: "Other (please share your feedback)" },
];

const CancelPlanDialog = ({ expiresOn }: { expiresOn?: string | Date }) => {
  const { isOpen, setOpen } = useCancelPlanDialogStore();
  const planType = useUserSessionStore((state) => state.userSession?.planType ?? "");

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      widthClassName="w-[min(36rem,calc(100vw-2rem))]"
      mark={
        <IconTile
          Icon={ProhibitIcon}
          size="lg"
          className="size-12 rounded-lg bg-bad/10 text-bad ring-bad/20 [&>svg]:size-6"
        />
      }
      eyebrow="Cancel plan"
      eyebrowClassName="text-bad"
      title={planType ? `${planType} plan` : "Your plan"}
      footer={
        <>
          <p className="flex min-w-0 items-center gap-2 text-[12.5px] text-muted-foreground">
            <WarningIcon className="size-4 shrink-0 text-warn" />
            <span className="truncate">This can’t be undone</span>
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton data-autofocus onClick={() => setOpen(false)}>
              Keep my plan
            </CardDialogButton>
            <CardDialogButton variant="danger" onClick={() => setOpen(false)}>
              Cancel plan
            </CardDialogButton>
          </div>
        </>
      }
    >
      <div className="space-y-5">
        <p className="flex items-start gap-2.5 rounded-lg bg-bad/[0.06] px-3.5 py-3 text-[13px] leading-5 text-ink-2 ring-1 ring-bad/20">
          <WarningIcon className="mt-0.5 size-4 shrink-0 text-bad" />
          <span>
            Cancelling your <span className="font-semibold text-ink">{planType}</span> plan{" "}
            <span className="font-semibold text-bad">permanently deletes your account</span>.
          </span>
        </p>

        <RecordSection title="What happens next">
          <RecordList>
            {getConsequences(planType, expiresOn).map(({ Icon, title, detail, isSevere }) => (
              <RecordListItem key={detail} className="items-start">
                <IconTile
                  Icon={Icon}
                  size="sm"
                  className={isSevere ? "bg-bad/10 text-bad ring-bad/20" : undefined}
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink">{title}</p>
                  <p className="text-[12.5px] text-muted-foreground">{detail}</p>
                </div>
              </RecordListItem>
            ))}
          </RecordList>
        </RecordSection>

        <RecordSection title="Why are you cancelling?">
          <RadioGroup className="gap-0 divide-y divide-line overflow-hidden rounded-lg ring-1 ring-line">
            {REASONS.filter((reason) => !reason.planType || reason.planType === planType).map(
              ({ id, value, label }) => (
                <Label
                  key={value}
                  htmlFor={id}
                  className="flex cursor-pointer items-center gap-3 bg-popover px-3.5 py-3 text-[13px] font-normal text-ink-2 transition-colors hover:bg-hover has-[[data-state=checked]]:bg-selected/50 has-[[data-state=checked]]:text-ink"
                >
                  <RadioGroupItem value={value} id={id} />
                  {label}
                </Label>
              ),
            )}
          </RadioGroup>
        </RecordSection>
      </div>
    </CardDialog>
  );
};

export default CancelPlanDialog;
