import { CommandItem } from "@aventisia/ui/command";
import { PublishedAgentDto } from "../dtos/published-agent-dto";
import { AgentsAssistItem } from "./AgentsAssistItem";

interface AAListProps {
  agentsList: PublishedAgentDto[] | undefined;
}

export const AgentsAssistList = ({ agentsList }: AAListProps) => {
  return (
    <>
      {agentsList?.map((item) => (
        <CommandItem
          key={item.id}
          value={`${item.name} ${item.versionNumber}`}
          className="group/CommandItem cursor-pointer rounded-lg p-1"
        >
          {/* flow item */}
          <AgentsAssistItem agentData={item} />
        </CommandItem>
      ))}
    </>
  );
};
