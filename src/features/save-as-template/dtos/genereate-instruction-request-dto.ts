export interface GenerateInstructionRequestDto {
  refType: "AIModel";
  refId: string; // model version id
  refName: string; // model name
  payload: string; // trimmed modelSetup json string
}
