import { BotIcon, BoxesIcon, Repeat2Icon, SplitIcon } from "lucide-react";

const IconContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="grid h-6 w-6 place-items-center rounded-lg bg-blue-100">
      {children}
    </div>
  );
};

const ConditionalNodeIcon = () => {
  return (
    <IconContainer>
      <SplitIcon className="h-3.5 w-3.5 rotate-180 stroke-[2.5] text-blue-600" />
    </IconContainer>
  );
};

const LoopNodeIcon = () => {
  return (
    <IconContainer>
      <Repeat2Icon className="h-3.5 w-3.5 stroke-[2.5] text-blue-600" />
    </IconContainer>
  );
};

const CallAgentIcon = () => {
  return (
    <IconContainer>
      <BotIcon className="h-3.5 w-3.5 stroke-[2.5] text-blue-600" />
    </IconContainer>
  );
};

const BlockNodeIcon = () => {
  return (
    <IconContainer>
      <BoxesIcon className="h-3.5 w-3.5 stroke-[2.5] text-blue-600" />
    </IconContainer>
  );
};

export { ConditionalNodeIcon, LoopNodeIcon, CallAgentIcon, BlockNodeIcon };
