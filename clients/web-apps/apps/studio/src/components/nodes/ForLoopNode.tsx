import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { Node, NodeProps, Position } from "@xyflow/react";
import { memo, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { useLiveExecutionStore } from "@/features/execute-flow/stores/live-execution-store";
import { getLivePathKey } from "@/features/execute-flow/utils/live-loop-index";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useExecutionStore } from "@/features/execution-logs/stores/execution-log-store";
import { LoopNodeDataType } from "@/types/loop-node-data-type";

import BaseNode from "./BaseNode";

type ForLoopNode = Node<LoopNodeDataType, "forLoopNode">;

// One badge for both canvases so the run and build pages cannot drift apart.
const LOOP_BADGE_CLASS =
  "absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 bg-bg";
const LOOP_SKIPPED_BADGE_CLASS = "absolute -top-8 left-1/2 -translate-x-1/2 px-2 bg-bg text-xs";
const LOOP_BADGE_INPUT_CLASS =
  "w-8 bg-transparent border-none outline-none text-center appearance-none focus:ring-0";

export const ForLoopNode = memo(
  ({ id, data, selected, sourcePosition, targetPosition }: NodeProps<ForLoopNode>) => {
    const [searchParams] = useSearchParams();
    const isExecutionLog = useIsExecutionLogsRoute();
    // 1. Destructure executionMap and nodeToParentStack from the store
    const {
      loopRegistry,
      activeIteration,
      setIteration,
      executionMap,
      skippedLoops,
      nodeToParentStack,
    } = useExecutionStore(
      useShallow((state) => ({
        loopRegistry: state.loopRegistry,
        activeIteration: state.activeIteration,
        setIteration: state.setIteration,
        executionMap: state.executionMap,
        skippedLoops: state.skippedLoops,
        nodeToParentStack: state.nodeToParentStack,
      })),
    );

    const { liveActiveIteration, setLiveIteration, liveExecutionMap, liveLoopIndex } =
      useLiveExecutionStore(
        useShallow((state) => ({
          liveActiveIteration: state.liveActiveIteration,
          setLiveIteration: state.setLiveIteration,
          liveExecutionMap: state.liveExecutionMap,
          liveLoopIndex: state.liveLoopIndex,
        })),
      );

    const liveExecutionData = liveLoopIndex;

    const total = loopRegistry[id]?.total || 0;
    const current = activeIteration[id] || 0;
    const liveTotal = liveExecutionData.loopRegistry[id]?.total || 0;
    const liveCurrent = liveActiveIteration[id] ?? Math.max(0, liveTotal - 1);

    // 2. Resolve the path coordinate for this loop's context
    const parents = nodeToParentStack[id] || [];
    const pathKey = parents.map((pid) => activeIteration[pid] ?? 0).join("-") || "global";

    // 3. Determine if this loop was actually reached in the current parent iteration
    const isActiveInCurrentPath = !!executionMap[id]?.[pathKey];
    const isSkipped = !!skippedLoops[id]?.[pathKey];
    const livePathKey = getLivePathKey(
      liveLoopIndex,
      searchParams.get("ci") || "",
      id,
      liveActiveIteration,
    );
    const isLiveSkipped = !!liveLoopIndex.skippedLoops[id]?.[livePathKey];

    const [inputValue, setInputValue] = useState(current + 1);
    const [liveInputValue, setLiveInputValue] = useState(liveCurrent + 1);

    useEffect(() => {
      setInputValue(current + 1);
    }, [current]);

    useEffect(() => {
      setLiveInputValue(liveCurrent + 1);
    }, [liveCurrent]);
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

    const goLivePrev = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!liveTotal) return;
      setLiveIteration(id, liveCurrent === 0 ? liveTotal - 1 : liveCurrent - 1);
    };

    const goLiveNext = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!liveTotal) return;
      setLiveIteration(id, liveCurrent === liveTotal - 1 ? 0 : liveCurrent + 1);
    };

    const handleLiveChange = (value: string) => {
      if (value === "") {
        setLiveInputValue(NaN);
        return;
      }
      const number = Number(value);
      if (!Number.isNaN(number)) setLiveInputValue(number);
    };

    const commitLiveInput = () => {
      if (!liveTotal) return;

      let value = liveInputValue;
      if (!value || Number.isNaN(value)) value = liveCurrent + 1;

      value = Math.max(1, Math.min(liveTotal, value));
      setLiveIteration(id, value - 1);
      setLiveInputValue(value);
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
        {isExecutionLog && isSkipped && isActiveInCurrentPath && (
          <Badge className={LOOP_SKIPPED_BADGE_CLASS} variant="default">
            Skipped
          </Badge>
        )}

        {isExecutionLog && !isSkipped && total > 0 && isActiveInCurrentPath && (
          <Badge className={LOOP_BADGE_CLASS} variant="default">
            <Button variant="ghost" size="icon5" onClick={goPrev}>
              <CaretLeftIcon />
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
                className={LOOP_BADGE_INPUT_CLASS}
              />
              <span>/</span>
              <p> {total}</p>
            </div>

            <Button variant="ghost" size="icon5" onClick={goNext}>
              <CaretRightIcon />
            </Button>
          </Badge>
        )}

        {!isExecutionLog && isLiveSkipped && liveExecutionMap[id] && (
          <Badge className={LOOP_SKIPPED_BADGE_CLASS} variant="default">
            Skipped
          </Badge>
        )}

        {!isExecutionLog && !isLiveSkipped && liveTotal > 0 && liveExecutionMap[id] && (
          <Badge className={LOOP_BADGE_CLASS} variant="default">
            <Button variant="ghost" size="icon5" onClick={goLivePrev}>
              <CaretLeftIcon />
            </Button>
            <div className="flex items-center gap-1 text-xs">
              <input
                type="text"
                value={Number.isNaN(liveInputValue) ? "" : liveInputValue}
                onChange={(e) => handleLiveChange(e.target.value)}
                onBlur={commitLiveInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitLiveInput();
                  }
                }}
                className={LOOP_BADGE_INPUT_CLASS}
              />
              <span>/</span>
              <p> {liveTotal}</p>
            </div>
            <Button variant="ghost" size="icon5" onClick={goLiveNext}>
              <CaretRightIcon />
            </Button>
          </Badge>
        )}

        <InputHandle position={targetPosition} connectionCount={1} />
        <InputHandle id="for-loop-repeat" position={Position.Top} connectionCount={1} />
        <OutputHandle position={sourcePosition} connectionCount={2} />
      </BaseNode>
    );
  },
);

ForLoopNode.displayName = "ForLoopNode";
