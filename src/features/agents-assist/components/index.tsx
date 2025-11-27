import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@aventisia/ui/command";
import { ScrollArea } from "@aventisia/ui/scroll";

import { useFetchSelectTableAgents } from "../hooks/useFetchSelectAgents";

import { AANoContentMessage } from "./AANoContentMessage";
import { AgentsAssistItem } from "./AgentsAssistItem";
import { AgentsAssistSearchBox } from "./AgentsAssistSearchBox";

/**
 * Renders the content of the Agents Assist component.
 */
export const AgentsAssist = () => {
  // TODO: get machine id through websocket in desktop
  const machineId = "";
  const { data } = useFetchSelectTableAgents(machineId);

  // Return the component
  return (
    <Command className="my-4 py-4">
      {/* cmdk input Searchbox */}
      <AgentsAssistSearchBox />

      {/* No content message */}
      <CommandEmpty className="h-full">
        <AANoContentMessage />
      </CommandEmpty>

      <>
        {/* Agents list */}
        <ScrollArea>
          <CommandList className="m-2 border-none">
            {data?.data?.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.name} ${item.versionNumber}`}
                className="group/CommandItem cursor-pointer rounded-lg p-1"
              >
                {/* Agent item */}
                <AgentsAssistItem agentData={item} />
              </CommandItem>
            ))}{" "}
          </CommandList>
        </ScrollArea>
      </>
    </Command>
  );
};
