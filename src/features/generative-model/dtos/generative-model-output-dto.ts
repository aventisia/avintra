export interface GenerativeModelOutputDTO {
    id: string;
    participantType: string;
    participantName: string;
    participantId: string | null;
    message: string;
    isUserMessage: boolean;
    timestamp: string;
    conversationId: string;
    mlModelName: string;
    mlModelId: string
}