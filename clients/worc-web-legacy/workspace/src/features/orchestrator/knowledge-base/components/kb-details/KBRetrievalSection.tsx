import { useState } from "react";

import { KnowledgeBaseRetrievalForm } from "./KBRetrievalForm";
import { RetrievedChunksAccordion } from "./RetrievedChunksAccordion";

export const KBRetrievalSection = () => {
  const [chunksRetrieved, setChunksRetrieved] = useState(false);

  return (
    <>
      {chunksRetrieved ? (
        <RetrievedChunksAccordion setChunksRetrieved={setChunksRetrieved} />
      ) : (
        <>
          <div className="p-4 pb-0">
            <p className="text-sm font-semibold">Knowledge Base Retrieval</p>
            <p className="text-xs">
              Search through your knowledge base by entering a query below. The
              system will retrieve the most chunks of information.
            </p>
          </div>

          <KnowledgeBaseRetrievalForm setChunksRetrieved={setChunksRetrieved} />
        </>
      )}{" "}
    </>
  );
};
