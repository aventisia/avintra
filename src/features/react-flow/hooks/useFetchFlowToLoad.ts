import { useShallow } from "zustand/react/shallow";
import { useEffect } from "react";
import { getFlowToLoad } from "../apis/react-flow-apis";
import { useLocation } from "react-router-dom";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

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
  const { setNodes, setEdges } = useReactFlowExtStore(
    useShallow((state) => ({
      setNodes: state.setNodes,
      setEdges: state.setEdges,
    })),
  );

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

        // Set nodes and edges
        setNodes(JSON.parse(data.data.nodes));
        setEdges(JSON.parse(data.data.edges));

        // Set document title
        document.title = `${data.data.name} - ${import.meta.env.VITE_COMPANY_NAME} ${import.meta.env.VITE_APP_NAME}`;
      }
    }

    fetchData();
  }, [location, setNodes, setEdges, setIsFlowLoading, setCurrentFlow]);

  // Return nodes and edges
};
