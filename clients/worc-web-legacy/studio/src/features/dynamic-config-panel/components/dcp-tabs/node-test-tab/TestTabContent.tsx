import ModelTestContent from "./llmGenerated/ModelTestContent";
import StandardTestContent from "./standard/StandardTestContent";

const TestTabContent = ({
  type,
  formData,
  testExecutionId,
}: {
  type: string;
  formData: {
    [x: string]: unknown;
  };
  testExecutionId: number;
}) => {
  return (
    <div>
      {type == "llmGenerateRequest" && <ModelTestContent formData={formData} />}
      {type == "standard" && (
        <StandardTestContent
          testExecutionId={testExecutionId}
          formData={formData}
        />
      )}
    </div>
  );
};

export default TestTabContent;
