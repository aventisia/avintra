import { buttonVariants } from "@avplatform/ui/buttons";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { Table } from "@tanstack/react-table";
import { BadgeDollarSignIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

interface PlanFilterProps<TData> {
  table: Table<TData>;
  data: TData[];
  columnId: string; // "activePlan"
}

const QUERY_KEY = "plan";

export function PlanFilter<TData>({ table, data, columnId }: PlanFilterProps<TData>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const column = table.getColumn(columnId);

  //  derive plans
  const planOptions = useMemo(() => {
    const set = new Set<string>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data as any[]).forEach((x) => {
      const plan = x?.activePlan ?? "Unknown";
      set.add(plan);
    });

    return Array.from(set).sort();
  }, [data]);

  const selectedPlans = (column?.getFilterValue() as string[]) ?? [];

  //  hydrate + default
  useEffect(() => {
    const param = searchParams.get(QUERY_KEY);

    if (param) {
      const plans = param.split(",");
      column?.setFilterValue(plans);
      return;
    }

    if (planOptions?.length > 0) {
      const defaultPlan = planOptions.includes("Pro") ? ["Pro"] : [planOptions[0]];
      column?.setFilterValue(defaultPlan);

      //  Read live URL for query params
      const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());

      params[QUERY_KEY] = defaultPlan.join(",");

      setSearchParams(params, { replace: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planOptions]);

  const updatePlans = (plans: string[]) => {
    column?.setFilterValue(plans);

    const params = Object.fromEntries(searchParams.entries());

    if (plans.length) {
      params[QUERY_KEY] = plans.join(",");
    } else {
      delete params[QUERY_KEY];
    }

    setSearchParams(params);
  };

  const togglePlan = (plan: string) => {
    const exists = selectedPlans.includes(plan);

    const updated = exists ? selectedPlans.filter((p) => p !== plan) : [...selectedPlans, plan];

    updatePlans(updated);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "outline", size: "xs" }), "hidden gap-2 lg:flex")}
      >
        <BadgeDollarSignIcon className="h-4 w-4" />
        Plan
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="p-2">
        <DropdownMenuLabel>Filter by Plan</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {planOptions.map((plan) => (
          <DropdownMenuCheckboxItem
            key={plan}
            checked={selectedPlans.includes(plan)}
            onCheckedChange={() => togglePlan(plan)}
            onSelect={(e) => e.preventDefault()}
          >
            {plan}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
