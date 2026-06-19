import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { Edge, Node, Viewport } from "@xyflow/react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { getFlowToLoad } from "@/features/react-flow/apis/react-flow-apis";
import { deepParse } from "@/features/react-flow/utils/deepParse";
import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

export const useFetchFlowToExecute = () => {
  const [isFlowReady, setIsFlowReady] = useState(false);
  const { setCurrentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      setCurrentFlow: state.setCurrentFlow,
    })),
  );

  // Get ReactFlowExt store state & actions
  const {
    setNodes,
    setEdges,
    setFlowVariablesObject,
    setIsPublished,
    setFlowType,
  } = useReactFlowExtStore(
    useShallow((state) => ({
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setFlowVariablesObject: state.setFlowVariablesObject,
      setIsPublished: state.setIsPublished,
      setFlowType: state.setFlowType,
    })),
  );
  const { mutate: getFlow } = useMutation({
    mutationFn: getFlowToLoad,
    onMutate: () => {
      setIsFlowReady(false); // reset flag on each call
    },
    onSuccess: (data) => {
      if (!data) return;
      // Set currently opened flow
      setCurrentFlow({
        id: data.data.id,
        name: data.data.name,
        versionId: data.data.versionId,
        versionNumber: data.data.versionNumber,
        isPublished: data.data.isPublished || false,
        isLocked: data.data.isLocked || false,
        isDraft: data.data.isDraft || false,
        isArchived: data.data.isArchived || false,
        type: data.data.type,
        description: data.data.description || "",
        accessType: data.data.accessType,
        inputOutputObject: data.data.inputOutputObject || "",
      });
      setIsPublished(data?.data?.isPublished || false);
      setFlowType(data?.data?.type || FlowTypesEnum.Agent);

      // Parse react flow object
      const flow = deepParse(data.data.reactFlowObject) as unknown as {
        nodes: Node[];
        edges: Edge[];
        viewport: Viewport;
      };

      // Parse Flow Variables Object
      const flowVarObjs = JSON.parse(data.data.flowVariablesObject);

      if (flow) {
        // Set nodes and edges
        setNodes(flow.nodes);
        setEdges(flow.edges);
        setFlowVariablesObject(flowVarObjs || []);
      }
      // ✅ All synchronous state updates done
      setIsFlowReady(true);
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.toString());
      // ✅ All synchronous state updates done
      setIsFlowReady(false);
    },
  });

  return { isFlowReady, getFlow };
};
