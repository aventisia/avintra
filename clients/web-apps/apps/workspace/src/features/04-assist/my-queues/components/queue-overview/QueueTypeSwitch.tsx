import { Tabs, TabsList, TabsTrigger } from "@avplatform/ui/tabs";

import { QueueTypesEnum } from "../../enums/queue-instance-type-enum";

interface QueueTypeSwitchProps {
  /** The currently selected queue type. */
  value: QueueTypesEnum;
  /** Invoked when the user toggles between User and Agent queues. */
  onChange: (value: QueueTypesEnum) => void;
}

const OPTIONS: { value: QueueTypesEnum; label: string }[] = [
  { value: QueueTypesEnum.User, label: "User Queues" },
  { value: QueueTypesEnum.Agent, label: "Agent Queues" },
];

/**
 * Segmented control to switch the Assist > Queues overview between the user's
 * own queues and the agent queues they have access to. Uses the same tabbed
 * style as the Usage screen's Platform Credits / BYOK Consumption switch.
 */
export const QueueTypeSwitch: React.FC<QueueTypeSwitchProps> = ({ value, onChange }) => {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as QueueTypesEnum)}>
      <TabsList>
        {OPTIONS.map((option) => (
          <TabsTrigger key={option.value} value={option.value}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
