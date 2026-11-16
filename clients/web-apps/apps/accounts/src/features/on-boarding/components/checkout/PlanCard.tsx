import { Badge } from "@avplatform/ui/badge";
import { cn } from "@avplatform/ui/lib";

import CustomRadioItem from "@/components/ui/CustomRadioItem";

import { formatCurrency } from "../../constants/currency-symbol-map";
import type { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { PlanFeatures } from "./PlanFeatures";

const TAGLINES: Record<string, string> = {
  Starter: "Explore agents and automate your first workflows.",
  Pro: "Run AI workflows in production, with room to grow.",
};

type PlanCardProps = {
  plan: SubscriptionPlanDTO;
  isSelected: boolean;
  isRecommended: boolean;
  yearlySavings: number;
};

const wholeAmount = { maximumFractionDigits: 0 };

export const PlanCard = ({ plan, isSelected, isRecommended, yearlySavings }: PlanCardProps) => {
  const isFree = plan.price <= 0;
  const isYearly = plan.frequency === "Yearly";
  const monthlyPrice = isYearly ? plan.price / 12 : plan.price;

  return (
    <CustomRadioItem
      value={plan.name}
      selected={isSelected ? plan.name : ""}
      highlightSelected={false}
      radioClassName="peer"
      className={cn(
        "flex cursor-pointer flex-col gap-5 rounded-2xl bg-background p-6 text-base font-normal leading-normal shadow-sm transition-all peer-focus-visible:ring-4 peer-focus-visible:ring-primary/30",
        isSelected
          ? "border-primary ring-4 ring-primary/10"
          : "border-border hover:border-foreground/25 hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            {isRecommended && <Badge>Recommended</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">{TAGLINES[plan.type] ?? ""}</p>
        </div>
        <span
          aria-hidden
          className={cn(
            "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            isSelected ? "border-primary" : "border-muted-foreground/40",
          )}
        >
          {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-semibold tracking-tight">
            {isFree ? "Free" : formatCurrency(monthlyPrice, plan.currency, wholeAmount)}
          </span>
          {!isFree && <span className="text-sm text-muted-foreground">/month</span>}
        </div>
        <p className="mt-1 h-5 text-sm text-muted-foreground">
          {isFree && "No card required"}
          {!isFree && isYearly && (
            <>
              Billed {formatCurrency(plan.price, plan.currency, wholeAmount)} yearly
              {yearlySavings > 0 && (
                <span className="ml-1.5 font-medium text-emerald-600">· save {yearlySavings}%</span>
              )}
            </>
          )}
          {!isFree && !isYearly && "Billed monthly"}
        </p>
      </div>

      <div className="border-t pt-5">
        <PlanFeatures plan={plan} />
      </div>
    </CustomRadioItem>
  );
};
