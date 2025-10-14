export interface GenerateInstructionRequestDto {
   refType: "Agent";
   refId: string; // flow/agent version id
   refName: string; // flow/agent name
   payload: string; // trimmed reactflowobject json string
}
