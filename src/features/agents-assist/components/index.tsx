import { Command, CommandEmpty, CommandList } from "@aventisia/ui/command";
import { ScrollArea } from "@aventisia/ui/scroll";
import { AgentsAssistList } from "./AgentsAssistList";
import { AANoContentMessage } from "./AANoContentMessage";
import { AgentsAssistSearchBox } from "./AgentsAssistSearchBox";
import { AgentsAssistSkeleton } from "./AgentsAssistSkeleton";
import { useFetchAgents } from "../hooks/useFetchAgents";

/**
 * Renders the content of the Agents Assist component.
 */
export const AgentsAssist = () => {
  const { data, isLoading } = useFetchAgents();

  // Return the component
  return (
    <Command className="pt-2">
      {/* cmdk input Searchbox */}
      <AgentsAssistSearchBox />

      {/* No content message */}
      <CommandEmpty className="h-full">
        <AANoContentMessage />
      </CommandEmpty>

      {isLoading ? (
        <AgentsAssistSkeleton />
      ) : (
        <>
          {/* Agents list */}
          <ScrollArea>
            <CommandList className="mx-2 mb-2 border-none">
              <AgentsAssistList agentsList={data?.data} />
            </CommandList>
          </ScrollArea>
        </>
      )}
    </Command>
  );
};
