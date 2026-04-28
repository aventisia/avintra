import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";
import { LoopNodeDataType } from "@/types/loop-node-data-type";

import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import { Node, NodeProps, Position } from "@xyflow/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { memo, useEffect, useState } from "react";

import BaseNode from "./BaseNode";

type ForLoopNode = Node<LoopNodeDataType, "forLoopNode">;

export const ForLoopNode = memo(
  ({
    id,
    data,
    selected,
    sourcePosition,
    targetPosition,
  }: NodeProps<ForLoopNode>) => {
    const isExecutionLog = useIsExecutionLogsRoute();
    // 1. Destructure executionMap and nodeToParentStack from the store
    const {
      loopRegistry,
      activeIteration,
      setIteration,
      executionMap,
      nodeToParentStack,
    } = useExecutionStore();

    const total = loopRegistry[id]?.total || 0;
    const current = activeIteration[id] || 0;

    // 2. Resolve the path coordinate for this loop's context
    const parents = nodeToParentStack[id] || [];
    const pathKey =
      parents.map((pid) => activeIteration[pid] ?? 0).join("-") || "global";

    // 3. Determine if this loop was actually reached in the current parent iteration
    const isActiveInCurrentPath = !!executionMap[id]?.[pathKey];

    const [inputValue, setInputValue] = useState(current + 1);

    useEffect(() => {
      setInputValue(current + 1);
    }, [current]);
    //  Circular navigation
    const goPrev = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!total) return;
      const next = current === 0 ? total - 1 : current - 1;
      setIteration(id, next);
    };

    const goNext = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!total) return;
      const next = current === total - 1 ? 0 : current + 1;
      setIteration(id, next);
    };

    //  Input logic
    const handleChange = (val: string) => {
      if (val === "") {
        setInputValue(NaN);
        return;
      }
      const num = Number(val);
      if (!Number.isNaN(num)) setInputValue(num);
    };

    const commitInput = () => {
      if (!total) return;

      let value = inputValue;
      if (!value || Number.isNaN(value)) {
        value = current + 1;
      }

      value = Math.max(1, Math.min(total, value));

      setIteration(id, value - 1);
      setInputValue(value);
    };

    return (
      <BaseNode selected={selected} nodeData={data} nodeId={id}>
        {isExecutionLog && total > 0 && isActiveInCurrentPath && (
          <Badge
            className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2"
            variant="default"
          >
            <Button variant="ghost" size="icon5" onClick={goPrev}>
              <ChevronLeftIcon />
            </Button>

            {/*  Inline editable text-style input */}
            <div className="flex items-center gap-1 text-xs">
              <input
                type="text"
                value={Number.isNaN(inputValue) ? "" : inputValue}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={commitInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitInput();
                  }
                }}
                className="
                  w-4
                  bg-transparent
                  border-none
                  outline-none
                  text-center
                  appearance-none
                  focus:ring-0
                "
              />
              <span>/</span>
              <p> {total}</p>
            </div>

            <Button variant="ghost" size="icon5" onClick={goNext}>
              <ChevronRightIcon />
            </Button>
          </Badge>
        )}

        <InputHandle position={targetPosition} connectionCount={1} />
        <InputHandle
          id="for-loop-repeat"
          position={Position.Top}
          connectionCount={1}
        />
        <OutputHandle position={sourcePosition} connectionCount={2} />
      </BaseNode>
    );
  },
);

ForLoopNode.displayName = "ForLoopNode";
