import { ArrowRightCircle, BoxesIcon, Power, Repeat2Icon, Slash, SplitIcon } from "lucide-react";

import NewAgentIcon from "./NewAgentIcon";

const IconContainer = ({ children }: React.PropsWithChildren) => {
  return <div className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100">{children}</div>;
};

const ConditionalNodeIcon = () => {
  return (
    <IconContainer>
      <SplitIcon className="h-5 w-5 rotate-180" />
    </IconContainer>
  );
};

const LoopNodeIcon = () => {
  return (
    <IconContainer>
      <Repeat2Icon className="h-5 w-5" />
    </IconContainer>
  );
};

const CallAgentIcon = () => {
  return (
    <IconContainer>
      <NewAgentIcon className="h-5 w-5" />
    </IconContainer>
  );
};

const BlockNodeIcon = () => {
  return (
    <IconContainer>
      <BoxesIcon className="h-5 w-5" />
    </IconContainer>
  );
};

const BreakLoopNodeIcon = () => (
  <IconContainer>
    <Slash className="h-5 w-5 " />
  </IconContainer>
);

const ContinueLoopNodeIcon = () => (
  <IconContainer>
    <ArrowRightCircle className="h-5 w-5 " />
  </IconContainer>
);

const ExitFlowNodeIcon = () => (
  <IconContainer>
    <Power className="h-5 w-5 " />
  </IconContainer>
);

export {
  ConditionalNodeIcon,
  LoopNodeIcon,
  CallAgentIcon,
  BlockNodeIcon,
  BreakLoopNodeIcon,
  ContinueLoopNodeIcon,
  ExitFlowNodeIcon,
};
