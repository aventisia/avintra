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

import { RetrievedChunkDto } from "../../apis/knowledge-base-file-apis";

export function RetrievedChunksAccordion({
  setChunksRetrieved,
  chunks,
}: {
  setChunksRetrieved: Dispatch<SetStateAction<boolean>>;
  chunks: RetrievedChunkDto[];
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
        {chunks.map((item, index) => (
          <AccordionItem
            key={`${item.similarity_score}-${index}`}
            value={`${index}`}
          >
            <AccordionTrigger className="group  flex w-full items-center justify-start gap-2 hover:!no-underline [&>svg]:hidden">
              <div className="z-10 flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                <ChevronRight className="h-3.5 w-3.5 text-primary transition-transform duration-200  group-data-[state=open]:rotate-90" />
              </div>
              <p className="text-sm font-medium flex-1 text-left hover:underline hover:underline-offset-4">
                Chunk {index + 1}
              </p>
              <Badge
                variant={"outline"}
                className=" text-xs text-primary bg-muted  border-muted font-medium "
              >
                {`${(item.similarity_score * 100).toFixed(2)}%`}
              </Badge>
            </AccordionTrigger>
            <AccordionContent className="text-xs pl-6 text-muted-foreground">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
        {chunks.length === 0 && (
          <p className="text-xs text-muted-foreground py-4">
            No chunks matched your query.
          </p>
        )}
      </Accordion>
    </div>
  );
}
