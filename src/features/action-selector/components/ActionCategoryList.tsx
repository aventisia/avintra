import { CommandItem, CommandList } from "@/react-toolkit/ui/command";
import { ActionCategory } from "./ActionCategory";
import { actionSelectorData } from "../constants/action-selector-data";
import { useNodeSelectorStore } from "../stores/action-selector-store";
import { useShallow } from "zustand/react/shallow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/react-toolkit/ui/accordion";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FallbackImageIcon } from "./FallbackImageIcon";
import { iconMapper } from "@/components/icon-mapper";
import { Separator } from "@/react-toolkit/ui/separator";

export const ActionCategoryList = () => {
  // Get primaryCategory, setActionCategory function from the store
  const { primaryCategoryLabel, setPrimaryCategoryLabel, setActionCategory } =
    useNodeSelectorStore(
      useShallow((state) => ({
        primaryCategoryLabel: state.primaryCategoryLabel,
        setPrimaryCategoryLabel: state.setPrimaryCategoryLabel,
        setActionCategory: state.setActionCategory,
      })),
    );

  // Get actionCategories based on primaryCategoryLabel
  const actionCategories = actionSelectorData.find(
    (item) => item.label === primaryCategoryLabel,
  )?.actionCategories;

  // Return the primary category list
  return (
    <CommandList>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon8"
          className="min-w-[2rem]"
          onClick={() => setPrimaryCategoryLabel(null)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h2 className="ml-2 w-full truncate text-sm">{primaryCategoryLabel}</h2>
      </div>
      {actionCategories?.map((item, index) => (
        <>
          <CommandItem className="rounded-lg p-1">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={item.name} className="border-none">
                <AccordionTrigger className="px-1.5 py-2">
                  <div className="flex w-full gap-3 text-sm">
                    {/* Category icon or image */}
                    {item.icon ? (
                      <div>{iconMapper[item.icon]}</div>
                    ) : (
                      <FallbackImageIcon src={item.img} />
                    )}
                    {item.label}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {item.actions?.map((action) => (
                    <CommandItem
                      key={action.name}
                      value={action.label}
                      className="rounded-lg p-1"
                      onSelect={() => setActionCategory(action.name)}
                    >
                      {/* Action item */}
                      <ActionCategory data={action} />
                    </CommandItem>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CommandItem>
          {/* Separator */}
          {index < actionSelectorData.length - 1 && (
            <div className="flex justify-center">
              <Separator
                orientation="horizontal"
                className="h-[0.5px] w-[90%]"
              />
            </div>
          )}
        </>
      ))}
    </CommandList>
  );
};
