import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";

type AudioPlaybackSpeedSelectProps = {
  value: string;
  onChange: (newRate: string) => void;
};

const AudioPlaybackSpeedSelect = ({
  value,
  onChange,
}: AudioPlaybackSpeedSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-20">
        <SelectValue placeholder="Playback Speed" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">1x</SelectItem>
        <SelectItem value="1.25">1.25x</SelectItem>
        <SelectItem value="1.5">1.5x</SelectItem>
        <SelectItem value="1.75">1.75x</SelectItem>
        <SelectItem value="2">2x</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default AudioPlaybackSpeedSelect;
