import LLMTestContent from "./llmGenerated/LLMTestContent";
import STTTestContent from "./llmGenerated/STTTestContent";
import TTSTestContent from "./llmGenerated/TTSTestContent";
import StandardTestContent from "./standard/StandardTestContent";

type AINodeUniqueName =
  | "CreateInferencingAIAgent"
  | "CreateConversationAIAgent"
  | "CreateSTTAIAgent"
  | "CreateTTSAIAgent";

const TestTabContent = ({
  type,
  formData,
  nodeUniqueName,
}: {
  type: string;
  nodeUniqueName: string | AINodeUniqueName;
  formData: { [x: string]: unknown };
}) => {
  if (type === "standard") {
    return <StandardTestContent formData={formData} />;
  }

  if (type !== "llmGenerateRequest") return null;

  // Routing now happens on the node's identity rather than sniffing
  // formData keys at runtime — each AI agent node type gets its own
  // dedicated test screen and payload logic.
  switch (nodeUniqueName as AINodeUniqueName) {
    case "CreateInferencingAIAgent":
    case "CreateConversationAIAgent":
      // Both nodes share an identical test UX (prompt + optional file
      // upload + output viewer); only their payload's `input` source
      // differs, which useLLMExecute already resolves generically.
      return <LLMTestContent formData={formData} nodeUniqueName={nodeUniqueName} />;

    case "CreateSTTAIAgent":
      return <STTTestContent formData={formData} />;

    case "CreateTTSAIAgent":
      return <TTSTestContent formData={formData} />;

    default:
      return null;
  }
};

export default TestTabContent;
