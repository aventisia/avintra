import ModelTestContent from "./llmGenerateRequest/ModelTestContent";
import StandardTestContent from "./standard/StandardTestContent";

const TestTabContent = ({ type }: { type: string }) => {
  return (
    <div>
      {type == "llmGenerateRequest" ? (
        <ModelTestContent />
      ) : (
        <StandardTestContent />
      )}
    </div>
  );
};

export default TestTabContent;
