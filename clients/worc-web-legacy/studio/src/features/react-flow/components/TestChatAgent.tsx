import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { Button } from "@aventisia/ui/buttons";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Panel } from "@xyflow/react";
import { FlaskConicalIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

export const TestChatAgent = () => {
  const { isTestChatOpen, setIsTestChatOpen } = useReactFlowExtStore(
    useShallow((state) => ({
      isTestChatOpen: state.isTestChatOpen,
      setIsTestChatOpen: state.setIsTestChatOpen,
    })),
  );

  return (
    <Panel position="top-right" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center gap-1 rounded-lg border bg-white shadow">
        {isTestChatOpen ? (
          <Button
            size="icon8"
            className="group"
            variant={"ghost"}
            onClick={() => setIsTestChatOpen(false)}
          >
            <XMarkIcon className="h-5 w-5 stroke-[2] text-[--icon-color] group-hover:text-primary" />
          </Button>
        ) : (
          <Button
            size={"sm"}
            className="group px-3 h-8 gap-1 hover:text-primary"
            variant={"outline"}
            onClick={() => setIsTestChatOpen(true)}
          >
            <FlaskConicalIcon className="h-[0.9rem] w-[0.9rem] stroke-[1.8] text-[--icon-color] group-hover:text-primary" />
            Test
          </Button>
        )}
      </div>
    </Panel>
  );
};
