import { useState } from "react";

import { RetrievedChunkDto } from "../../apis/knowledge-base-file-apis";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { KnowledgeBaseRetrievalForm } from "./KBRetrievalForm";
import { RetrievedChunksAccordion } from "./RetrievedChunksAccordion";

export const KBRetrievalSection = ({
  knowledgeBaseId,
  knowledgeBaseName,
  knowledgeBase,
}: {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  knowledgeBase?: KnowledgeBaseTableDto;
}) => {
  const [chunksRetrieved, setChunksRetrieved] = useState(false);
  const [chunks, setChunks] = useState<RetrievedChunkDto[]>([]);

  return (
    <>
      {chunksRetrieved ? (
        <RetrievedChunksAccordion
          setChunksRetrieved={setChunksRetrieved}
          chunks={chunks}
        />
      ) : (
        <>
          <div className="px-[1.1rem] py-3.5 pb-0">
            <p className="text-sm font-semibold">Test Chunks Retrieval</p>
            <p className="text-2xs mb-1 text-muted-foreground">
              Search through your knowledge base by entering a query below. The
              system will retrieve the most relevant chunks of information.
            </p>
          </div>

          <KnowledgeBaseRetrievalForm
            setChunksRetrieved={setChunksRetrieved}
            setChunks={setChunks}
            knowledgeBaseId={knowledgeBaseId}
            knowledgeBaseName={knowledgeBaseName}
            knowledgeBase={knowledgeBase}
          />
        </>
      )}{" "}
    </>
  );
};
