import { Calculator, Database, Sigma } from "lucide-react";
import { useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/ui/components/popover";
import { cn } from "@/ui/lib";

import { type UiBuilderCalculationSection } from "./ui-builder-calculations";

type UiBuilderCalculationsButtonProps = {
  sections: UiBuilderCalculationSection[];
  className?: string;
};

/**
 * "How numbers are calculated" control: lists every server-computed figure on the interface with
 * its plain-language formula and the filters in force, plus formulas the page derives itself.
 */
export const UiBuilderCalculationsButton = ({
  sections,
  className,
}: UiBuilderCalculationsButtonProps) => {
  const [open, setOpen] = useState(false);
  if (sections.length === 0) return null;

  const figureCount = sections.reduce(
    (total, section) => total + section.metrics.length + section.derived.length,
    0,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="How numbers are calculated"
        className={cn(
          "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-2xs font-medium text-slate-600 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-700",
          className,
        )}
      >
        <Calculator className="h-3.5 w-3.5" />
        How numbers are calculated
        {figureCount > 0 && (
          <span className="rounded-full bg-indigo-50 px-1.5 text-[10px] font-semibold text-indigo-700">
            {figureCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[420px] max-w-[calc(100vw-2rem)] p-0">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">How numbers are calculated</p>
          <p className="text-2xs text-slate-500">
            Figures are computed by the platform from live queue work items, using the filters
            currently selected on the page.
          </p>
        </div>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-4 py-3">
          {sections.map((section) => (
            <section key={section.id} className="space-y-2">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Sigma className="h-3.5 w-3.5 text-indigo-500" />
                  {section.title}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                  <Database className="h-3 w-3" />
                  Queue · {section.queueName}
                </p>
                {section.description && (
                  <p className="mt-1 text-2xs leading-relaxed text-slate-500">
                    {section.description}
                  </p>
                )}
              </div>
              {(section.metrics.length > 0 || section.derived.length > 0) && (
                <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {[...section.metrics, ...section.derived].map((item, index) => (
                    <div key={`${item.label}-${index}`} className="px-3 py-2">
                      <dt className="text-2xs font-semibold text-slate-800">{item.label}</dt>
                      <dd className="mt-0.5 text-2xs leading-relaxed text-slate-600">
                        {item.formula}
                        {index >= section.metrics.length && (
                          <span className="ml-1 rounded bg-slate-100 px-1 text-[10px] text-slate-500">
                            calculated on the page
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </section>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
