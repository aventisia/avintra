import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@aventisia/ui/accordion";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { Tooltip } from "@aventisia/ui/tooltip";
import { ArrowLeftIcon, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const items = [
  {
    value: "75.25%",
    trigger: "How do I reset my password?",
    content:
      "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a link to reset your password. The link will expire in 24 hours.",
  },
  {
    value: "87.55%",
    trigger: "Can I change my subscription plan?",
    content:
      "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle.",
  },
  {
    value: "89.99%",
    trigger: "What payment methods do you accept?",
    content:
      "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our payment partners.",
  },
];

export function RetrievedChunksAccordion({
  setChunksRetrieved,
}: {
  setChunksRetrieved: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div>
      <div className="border-b px-1 h-12 flex items-center  gap-1">
        <Tooltip content="Back">
          <Button
            variant="ghost"
            size="icon8"
            onClick={() => setChunksRetrieved(false)}
          >
            <ArrowLeftIcon className="h-4 w-4 text-[--icon-color]" />
            <span className="sr-only">Back</span>
          </Button>
        </Tooltip>
        <p className="text-sm font-semibold">Retrieved Chunks</p>
      </div>
      <Accordion type="single" collapsible className="px-4">
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger className="group  flex w-full items-center justify-start gap-2 hover:!no-underline [&>svg]:hidden">
              <div className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                <ChevronRight className="h-3.5 w-3.5 text-primary transition-transform duration-200  group-data-[state=open]:rotate-90" />
              </div>
              <p className="text-sm font-medium flex-1 text-left hover:underline hover:underline-offset-4">
                {item.trigger}
              </p>
              <Badge
                variant={"outline"}
                className=" text-xs text-primary bg-muted  border-muted font-medium "
              >
                {item.value}
              </Badge>
            </AccordionTrigger>
            {/* <AccordionTrigger className="text-sm">
              {item.trigger}
            </AccordionTrigger> */}
            <AccordionContent className="text-xs pl-6 text-muted-foreground">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
