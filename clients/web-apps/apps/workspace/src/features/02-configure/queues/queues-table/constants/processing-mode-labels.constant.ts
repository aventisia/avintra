import { QueueProcessingModeEnum } from "../enums/queue-processing-mode-enum";

/** UI labels for queue processing modes; the stored "Manual" mode is branded "Flexible". */
export const PROCESSING_MODE_LABELS: Record<QueueProcessingModeEnum, string> = {
  [QueueProcessingModeEnum.Manual]: "Flexible",
  [QueueProcessingModeEnum.Fifo]: "Fifo",
};
