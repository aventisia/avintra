import {
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";

const iconWrapperStyle = "relative h-6 w-6";
const iconTextStyle =
  "text-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-400";

export const customAudioPlayerIcons = {
  forward: (
    <div className={iconWrapperStyle}>
      <RotateCwIcon />
      <p className={iconTextStyle}>5</p>
    </div>
  ),
  rewind: (
    <div className={iconWrapperStyle}>
      <RotateCcwIcon />
      <p className={iconTextStyle}>5</p>
    </div>
  ),
  play: (
    <PlayIcon className="border-2 border-primary text-primary rounded-full p-1 w-8 h-8 fill-primary" />
  ),
  pause: (
    <PauseIcon className="border-2 border-primary text-primary rounded-full p-1 w-8 h-8 fill-primary" />
  ),
  volume: <Volume2Icon className="text-slate-400" />,
  volumeMute: <VolumeXIcon className="text-slate-400" />,
};
