import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";

import { ConversationChannelEnum } from "../enums/conversation-channel.enum";

export type ChannelFilterValue = "all" | ConversationChannelEnum;

type ChannelFilterProps = {
  value: ChannelFilterValue;
  onChange: (value: ChannelFilterValue) => void;
};

export const ChannelFilter = ({ value, onChange }: ChannelFilterProps) => (
  <Select value={value} onValueChange={(next) => onChange(next as ChannelFilterValue)}>
    <SelectTrigger aria-label="Filter by channel" className="w-[150px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All channels</SelectItem>
      <SelectItem value={ConversationChannelEnum.Chat}>Chat</SelectItem>
      <SelectItem value={ConversationChannelEnum.Voice}>Voice</SelectItem>
    </SelectContent>
  </Select>
);
