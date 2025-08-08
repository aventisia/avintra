import {
  languageProps,
  voiceProps,
} from "@/features/ai-persona-model/constants/ai-persona-setup-form-field-props";
import { SelectField } from "@/shared/select-field/SelectField";

const OnPremConfig = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SelectField {...languageProps} />
      <SelectField {...voiceProps} />
    </div>
  );
};

export default OnPremConfig;
