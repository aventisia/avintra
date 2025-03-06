import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { getFlowToLoad } from "../apis/react-flow-apis";

export const useFetchFlowToLoad = () => {
  // Get flowId (f)
  const location = useLocation();

  // Get global store state & actions
  const { setCurrentFlow, setIsFlowLoading } = useCurrentFlowStore(
    useShallow((state) => ({
      setCurrentFlow: state.setCurrentFlow,
      setIsFlowLoading: state.setIsFlowLoading,
    })),
  );

  // Get ReactFlowExt store state & actions
  const { setNodes, setEdges, setFlowVariablesObject } = useReactFlowExtStore(
    useShallow((state) => ({
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      setFlowVariablesObject: state.setFlowVariablesObject
    })),
  );

  // Get react flow hook to set viewport
  const { setViewport, fitView } = useReactFlow();

  // Get flow when flowId changes
  useEffect(() => {
    async function fetchData() {
      // Get flow id from url
      const queryParams = new URLSearchParams(location.search);
      const flowId = queryParams.get("f");

      // Set flow loading flag
      setIsFlowLoading(true);

      // Get flow
      const data = await getFlowToLoad(flowId || "flowId");

      if (data) {
        // Set flow loading flag
        setIsFlowLoading(false);

        // Set currently opened flow
        setCurrentFlow({
          id: data.data.id,
          name: data.data.name,
        });

        // Parse react flow object
        const flow = JSON.parse(data.data.reactFlowObject);

        if (flow) {
          // Set nodes and edges
          setNodes(flow.nodes);
          setEdges(flow.edges);
          setFlowVariablesObject(flow.flowVariablesObject)

          // If flow has more than 2 nodes then set the saved viewport
          if (flow.nodes.length > 2) {
            setViewport(flow.viewport, { duration: ZOOM_ANIMATION_DURATION });
          } else {
            // Fit view if less than 2 nodes
            fitView({ duration: ZOOM_ANIMATION_DURATION });
          }
        }

        // Set document title
        document.title = `${data.data.name} - ${import.meta.env.VITE_COMPANY_NAME} ${import.meta.env.VITE_APP_NAME}`;
      }
    }

    fetchData();
  }, [location, setNodes, setEdges, setFlowVariablesObject, setIsFlowLoading, setCurrentFlow, setViewport, fitView]);
};
