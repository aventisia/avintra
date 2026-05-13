import { JsonViewer } from "@/components/json-viewer/JsonViewer";
import JsonViewerSkeleton from "@/components/json-viewer/JsonViewerSkeleton";
import { VectorStoreQueryRequestDto } from "@/features/dynamic-config-panel/apis/vector-store-apis";
import { DCPTabsContent } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsContent";
import { useRetrieveChunksMutation } from "@/features/dynamic-config-panel/hooks/useRetrieveChunksMutation";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { ModelConfigType } from "@/types/model-config-type";

import { useEffect } from "react";

interface Props {
  formData: Record<string, unknown>;
  testExecutionId: number;
}

const RetrieveDocumentsTest = ({ formData, testExecutionId }: Props) => {
  /*  Retrieve chunks mutation  */
  const { mutate, data, isPending } = useRetrieveChunksMutation();

  /* Helper to parse comma separated values */
  function parseCommaSeparatedValues(
    value?: string | null,
  ): string[] | undefined {
    // Stop if empty
    if (!value?.trim()) return undefined;

    // Split -> trim -> remove duplicates
    return [
      ...new Set(
        value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      ),
    ];
  }

  /* Extract model config from dynamic form data */

  function getModelConfig(data: Record<string, unknown>): {
    config: ModelConfigType;
    key: string;
  } | null {
    // Search dynamic form keys
    for (const key in data) {
      // Match model config keys
      if (key.startsWith("__ModelConfig__")) {
        return {
          config: data[key] as ModelConfigType,

          key,
        };
      }
    }

    return null;
  }

  /*  Build RetrieveDocuments payload */

  async function buildRetrieveChunksPayload(
    formData: Record<string, unknown>,
  ): Promise<VectorStoreQueryRequestDto | null> {
    try {
      /* Get current flow metadata   */

      const currentFlow = useCurrentFlowStore.getState().currentFlow;

      /* Extract model configuration */

      const modelConfigData = getModelConfig(formData);

      // Stop if embedding config missing
      if (!modelConfigData) {
        return null;
      }

      const { config: modelConfig } = modelConfigData;

      /*Search filter type         */

      const searchFilterType = formData.searchFilterType as
        | "none"
        | "documentNames"
        | "knowledgeBaseNames"
        | "both";

      /*   Base payload            */

      const payload: VectorStoreQueryRequestDto = {
        // Selected vector DB provider
        vector_store: String(formData.vectorStore),

        // Embedding provider
        embedding_provider: modelConfig.provider,

        // Embedding model
        embedding_model: modelConfig.model,

        // Search query
        query: String(formData.inputText ?? ""),

        // Number of chunks to retrieve
        top_k: Number(formData.numberOfChunks ?? 5),

        // Similarity threshold
        score_threshold: Number(formData.scoreThreshold ?? 0.5),

        // Optional credential id
        embedding_credential_id: modelConfig.credential_id || undefined,

        /* Flow execution metadata */

        ref_type: "Agent",

        ref_id: currentFlow.id,

        ref_name: currentFlow.name,

        action: "AgentExecution",

        agent_name: currentFlow.name,
      };

      /* Knowledge base filters */

      if (
        searchFilterType === "knowledgeBaseNames" ||
        searchFilterType === "both"
      ) {
        payload.kb_names = parseCommaSeparatedValues(
          formData.knowledgeBaseNames as string,
        );
      }

      /* Document filters */

      if (searchFilterType === "documentNames" || searchFilterType === "both") {
        payload.doc_names = parseCommaSeparatedValues(
          formData.documentNames as string,
        );
      }

      /*  Final payload ready  */

      return payload;
    } catch (error) {
      console.error(error);

      return null;
    }
  }

  /*  Execute test ONLY when testExecutionId changes */

  useEffect(() => {
    // Prevent execution on first mount
    if (!testExecutionId) return;

    async function execute() {
      // Build request payload
      const payload = await buildRetrieveChunksPayload(formData);

      // Stop if payload generation failed
      if (!payload) return;

      // Execute API
      mutate(payload);
    }

    execute();
  }, [testExecutionId]);

  /* Render result */

  return (
    <DCPTabsContent tabValue="Test" hasFooter={false}>
      <div className="text-xs ml-0.5 mb-1">Output</div>
      <div className="border-dividers overflow-hidden rounded-lg border border-solid">
        {/*   Loading state     */}

        {isPending ? (
          <JsonViewerSkeleton />
        ) : (
          /* API response viewer */

          <JsonViewer
            jsonData={JSON.stringify(data ?? {}, null, 2)}
            className="h-[70vh]"
          />
        )}
      </div>
    </DCPTabsContent>
  );
};

export default RetrieveDocumentsTest;
