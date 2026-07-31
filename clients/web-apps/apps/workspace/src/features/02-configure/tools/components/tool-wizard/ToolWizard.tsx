import { Button } from "@avplatform/ui/buttons";

import { useToolWizardStore } from "../../stores/tool-wizard.store";
import { StepAuthenticate } from "./StepAuthenticate";
import { StepIngestSpec } from "./StepIngestSpec";
import { StepPlayground } from "./StepPlayground";

/**
 * Multi-step wizard for adding a custom tool.
 */
export const ToolWizard = () => {
  const { currentStep, setCurrentStep } = useToolWizardStore();

  const steps = [
    { key: "ingest", label: "Ingest Spec", component: <StepIngestSpec /> },
    { key: "authenticate", label: "Authenticate", component: <StepAuthenticate /> },
    { key: "playground", label: "Playground", component: <StepPlayground /> },
  ] as const;

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <Button
            key={step.key}
            variant={currentStep === step.key ? "default" : "outline"}
            onClick={() => setCurrentStep(step.key)}
            disabled={index > currentIndex}
          >
            {index + 1}. {step.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border p-4">{steps[currentIndex].component}</div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={currentIndex === 0}
          onClick={() => setCurrentStep(steps[currentIndex - 1].key)}
        >
          Previous
        </Button>
        <Button
          disabled={currentIndex === steps.length - 1}
          onClick={() => setCurrentStep(steps[currentIndex + 1].key)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
