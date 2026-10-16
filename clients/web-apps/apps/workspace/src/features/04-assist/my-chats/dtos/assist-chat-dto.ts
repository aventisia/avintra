import { ConversationSummaryDto } from "./conversation-summary-dto";

export interface AssistChatDto {
  /** Unique identifier of the associated flow version */
  id: string; // Guid → string

  /** Name of the flow */
  name: string;

  /** Description of the block or template */
  description?: string | null;

  /** Indicates whether the flow version is archived */
  isArchived: boolean;

  /** Version number of the flow version */
  versionNumber: number;

  defaultActions?: string[];

  /** Who speaks first in a VoiceAgent conversation: "human" or "ai". */
  firstSpeaker?: string;

  /** VoiceAgent introduction played once per conversation. */
  voiceIntroduction?: string;

  /** List of conversations (ordered by most recent first) */
  conversations: ConversationSummaryDto[];

  /** Username of the modifier */
  lastModifiedByUsername?: string | null;

  /** Username of the user who last modified the record */
  lastModifiedBy?: string | null;

  /** Date and time when the record was last modified */
  lastModifiedOn?: Date | string | null; // DateTimeOffset → ISO string
}
