import { AppLogo } from "@avplatform/layout/logo";
import { MinimalFooter } from "@avplatform/layout/minimal-footer";
import { Skeleton } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Form } from "@avplatform/ui/form";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { RadioGroup } from "@avplatform/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { resolvePostLoginDestination } from "@/constants/post-login-destination";
import { COUNTRY_LS_KEY } from "@/constants/variables";

import { billingInfoSchema } from "../../constants/billing-info-zod-schema";
import type { SubscriptionPlanDTO } from "../../dtos/subscription-plans-dto";
import { useDefineBillingInfoForm } from "../../hooks/useDefineBillingInfoForm";
import { useFetchSubscriptionPlans } from "../../hooks/useFetchSubscriptionPlans";
import { useInsertSubscriptionMutation } from "../../hooks/useInsertSubscriptionMutation";
import { useSaveDeferredTenantProfile } from "../../hooks/useSaveDeferredTenantProfile";
import type { PlanFrequency } from "../../types/plan-type";
import { setBillingDataInStorage } from "../../utils";
import { BillingFields } from "./BillingFields";
import { OrderSummary } from "./OrderSummary";
import { PlanCard } from "./PlanCard";

const GST = 0.18;
const CURRENCIES = ["USD", "INR", "EUR", "GBP"];
const CURRENCY_LABELS: Record<string, string> = {
  USD: "USD ($)",
  INR: "INR (₹)",
  EUR: "EUR (€)",
  GBP: "GBP (£)",
};

type PlanOption = { name: string; monthly?: SubscriptionPlanDTO; yearly?: SubscriptionPlanDTO };

const buildPlanOptions = (plans: SubscriptionPlanDTO[]) => {
  const options = new Map<string, PlanOption>();
  for (const plan of plans) {
    if (plan.type === "Enterprise") continue;
    const option = options.get(plan.name) ?? { name: plan.name };
    const key = plan.frequency === "Yearly" ? "yearly" : "monthly";
    option[key] ??= plan;
    options.set(plan.name, option);
  }
  return [...options.values()].sort((a, b) => priceOf(a) - priceOf(b));
};

const priceOf = (option: PlanOption) => option.monthly?.price ?? (option.yearly?.price ?? 0) / 12;

const planFor = (option: PlanOption, frequency: PlanFrequency) =>
  (frequency === "yearly" ? option.yearly : option.monthly) ?? option.monthly ?? option.yearly!;

const yearlySavings = ({ monthly, yearly }: PlanOption) =>
  monthly?.price && yearly ? Math.round((1 - yearly.price / (monthly.price * 12)) * 100) : 0;

export const Checkout = ({ hasActiveSubscription }: { hasActiveSubscription: boolean }) => {
  useDocumentTitle("Choose your plan");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userSession = useUserSessionStore((state) => state.userSession);
  const isIndia = localStorage.getItem(COUNTRY_LS_KEY) === "India";
  const defaultPlanType = hasActiveSubscription ? "Pro" : "Starter";

  const [frequency, setFrequency] = useState<PlanFrequency>(() =>
    searchParams.get("frequency")?.toLowerCase() === "yearly" ? "yearly" : "monthly",
  );
  const [currency, setCurrency] = useState(() => {
    const requested = searchParams.get("currency")?.toUpperCase() ?? "";
    if (isIndia) return "INR";
    return CURRENCIES.includes(requested) ? requested : "USD";
  });
  const [selectedName, setSelectedName] = useState(
    () => searchParams.get("plan") || defaultPlanType,
  );

  const monthlyPlans = useFetchSubscriptionPlans(`?currency=${currency}&frequency=monthly`);
  const yearlyPlans = useFetchSubscriptionPlans(`?currency=${currency}&frequency=yearly`);
  const isLoading = monthlyPlans.isLoading || yearlyPlans.isLoading;
  const options = buildPlanOptions([
    ...(monthlyPlans.data?.data ?? []),
    ...(yearlyPlans.data?.data ?? []),
  ]);
  const bestSavings = Math.max(0, ...options.map(yearlySavings));

  const selectedOption =
    options.find((o) => o.name.toLowerCase() === selectedName.toLowerCase()) ??
    options.find((o) => planFor(o, frequency).type === defaultPlanType) ??
    options[0];
  const plan = selectedOption && planFor(selectedOption, frequency);
  // IMPORTANT NOTE: the backend prices India-based tenants in INR whatever currency is requested.
  const billedCurrency = plan?.currency ?? currency;
  const isCurrencyFixed = isIndia || billedCurrency !== currency;

  const { form, isSubmitting, isSetupPending, isIndividualUser, disableCountryDD } =
    useDefineBillingInfoForm();
  const { saveDeferredTenantProfile, isSavingDeferredProfile } = useSaveDeferredTenantProfile();
  const { insertSubscriptionMutation, isPending: isPurchasing } = useInsertSubscriptionMutation();

  // A free plan needs no billing details unless the tenant still has no subscription to fall back on.
  const needsBilling = !!plan && (plan.price > 0 || !hasActiveSubscription);
  const isTaxApplicable = !!plan && plan.price > 0 && form.watch("country") === "India";
  const tax = isTaxApplicable && plan ? +(plan.price * GST).toFixed(2) : 0;
  const total = plan ? +(plan.price + tax).toFixed(2) : 0;

  const continueOnStarter = () =>
    navigate(
      "/redirect?msg=Opening your workspace...&url=" +
        resolvePostLoginDestination(userSession?.email ?? ""),
    );

  const onSubmit = async (formData: z.infer<typeof billingInfoSchema>) => {
    if (!plan) return;
    if (isSetupPending && !(await saveDeferredTenantProfile(formData))) return;

    setBillingDataInStorage(userSession?.tenantId, formData);

    if (formData.country === "India" && billedCurrency !== "INR") {
      setCurrency("INR");
      toast.info("Billing in India uses INR pricing. Review your total in INR, then continue.");
      return;
    }

    insertSubscriptionMutation({
      planId: plan.id,
      amount: total,
      taxRate: GST,
      frequency: plan.frequency.toLowerCase(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      addressLine1: formData.addressLine1,
      addressLine2: formData.addressLine2,
      city: formData.city,
      postalCode: formData.postalCode,
      state: formData.state,
      country: formData.country,
      gstNumber: formData.gstNumber,
      isWillingToFileGst: !!formData.isWillingToFileGst,
    });
  };

  const isBusy = isSubmitting || isSavingDeferredProfile || isPurchasing;

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <AppLogo showFullLogo={true} className="h-7" />
          {userSession?.email && (
            <p className="truncate text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{userSession.email}</span>
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            {userSession?.firstName && (
              <p className="text-sm font-medium text-primary">Welcome, {userSession.firstName}</p>
            )}
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Choose your plan</h1>
            <p className="mt-2 text-muted-foreground">
              Start free on Starter, or unlock more with Pro whenever you're ready.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isCurrencyFixed && (
              <Select value={currency} onValueChange={setCurrency} disabled={isBusy}>
                <SelectTrigger className="w-28 bg-background" aria-label="Currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {CURRENCY_LABELS[code]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Tabs value={frequency} onValueChange={(value) => setFrequency(value as PlanFrequency)}>
              <TabsList className="bg-background shadow-sm">
                <TabsTrigger value="monthly" disabled={isBusy}>
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="yearly" disabled={isBusy} className="gap-2">
                  Yearly
                  {bestSavings > 0 && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600">-{bestSavings}%</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Form
          methods={form}
          onSubmit={form.handleSubmit(onSubmit)}
          disabled={isBusy}
          checkDirtyForm={false}
          className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8"
        >
          <div className="space-y-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[0, 1].map((key) => (
                  <Skeleton key={key} className="h-[26rem] rounded-2xl" />
                ))}
              </div>
            ) : options.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background p-10 text-center">
                <p className="font-medium">No plans are available in {currency} yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">Try another currency.</p>
              </div>
            ) : (
              <RadioGroup
                value={selectedOption?.name}
                onValueChange={setSelectedName}
                className="grid gap-4 sm:grid-cols-2"
                aria-label="Plan"
              >
                {options.map((option) => (
                  <PlanCard
                    key={option.name}
                    plan={planFor(option, frequency)}
                    isSelected={option === selectedOption}
                    isRecommended={planFor(option, frequency).type === "Pro"}
                    yearlySavings={yearlySavings(option)}
                  />
                ))}
              </RadioGroup>
            )}

            {needsBilling && (
              <BillingFields
                isSetupPending={isSetupPending}
                isIndividualUser={isIndividualUser}
                disableCountryDD={disableCountryDD}
              />
            )}
          </div>

          {plan && (
            <OrderSummary
              plan={plan}
              tax={tax}
              total={total}
              isTaxApplicable={isTaxApplicable}
              needsBilling={needsBilling}
              isPending={isBusy}
              onContinueFree={continueOnStarter}
            />
          )}
        </Form>
      </main>

      <MinimalFooter />
    </div>
  );
};
