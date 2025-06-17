import {
  enableAudioProps,
  enableChatProps,
  enableVideoProps,
} from "@/features/ai-persona-model/constants/ai-persona-setup-form-field-props";

import { CheckboxField } from "@aventisia/ui/form";

const CommunicationChannels = () => {
  return (
    <div className="space-y-4">
      <p className="text-base">Communication Channels</p>
      <div className="flex items-center gap-2">
        <CheckboxField {...enableAudioProps} />
        <span className="text-sm">Audio</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckboxField {...enableVideoProps} />
        <span className="text-sm">Video</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckboxField {...enableChatProps} />
        <span className="text-sm">Chat</span>
      </div>
    </div>
  );
};

export default CommunicationChannels;
