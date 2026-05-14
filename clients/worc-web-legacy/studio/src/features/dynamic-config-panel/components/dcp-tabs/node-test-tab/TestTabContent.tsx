import ModelTestContent from "./llmGenerated/ModelTestContent";
import StandardTestContent from "./standard/StandardTestContent";

const TestTabContent = ({
  type,
  formData,
}: {
  type: string;
  formData: {
    [x: string]: unknown;
  };
}) => {
  return (
    <div>
      {type == "llmGenerateRequest" && <ModelTestContent formData={formData} />}
      {type == "standard" && <StandardTestContent formData={formData} />}
    </div>
  );
};

export default TestTabContent;
