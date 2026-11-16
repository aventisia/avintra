import {
  ArrowCircleRightIcon,
  ArrowsSplitIcon,
  PackageIcon,
  PowerIcon,
  ProhibitIcon,
  RepeatIcon,
} from "@phosphor-icons/react";

import NewAgentIcon from "./NewAgentIcon";

const IconContainer = ({ children }: React.PropsWithChildren) => {
  return <div className="grid h-7 w-7 place-items-center rounded-lg bg-sunken">{children}</div>;
};

const ConditionalNodeIcon = () => {
  return (
    <IconContainer>
      <ArrowsSplitIcon className="h-5 w-5 rotate-180" />
    </IconContainer>
  );
};

const LoopNodeIcon = () => {
  return (
    <IconContainer>
      <RepeatIcon className="h-5 w-5" />
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
      <PackageIcon className="h-5 w-5" />
    </IconContainer>
  );
};

const BreakLoopNodeIcon = () => (
  <IconContainer>
    <ProhibitIcon className="h-5 w-5 " />
  </IconContainer>
);

const ContinueLoopNodeIcon = () => (
  <IconContainer>
    <ArrowCircleRightIcon className="h-5 w-5 " />
  </IconContainer>
);

const ExitFlowNodeIcon = () => (
  <IconContainer>
    <PowerIcon className="h-5 w-5 " />
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
