export interface VoiceOption {
  label: string;
  value: string;
  languageId?: string;
}

export interface VoiceProviderData {
  languages: { label: string; value: string }[];
  voices: VoiceOption[];
}
//TODO: generated form llm need to test
export const voiceProviderData: Record<string, VoiceProviderData> = {
  elevenlabs: {
    languages: [
      { label: "English", value: "en" },
      { label: "Spanish", value: "es" },
      { label: "French", value: "fr" },
      { label: "German", value: "de" },
      { label: "Hindi", value: "hi" },
      { label: "Italian", value: "it" },
      { label: "Portuguese", value: "pt" },
      { label: "Polish", value: "pl" },
      { label: "Japanese", value: "ja" },
      { label: "Chinese", value: "zh" },
      { label: "Korean", value: "ko" },
      { label: "Dutch", value: "nl" },
      { label: "Turkish", value: "tr" },
      { label: "Swedish", value: "sv" },
      { label: "Indonesian", value: "id" },
      { label: "Arabic", value: "ar" },
    ],
    voices: [
      {
        label: "Rachel (Calm, American Female)",
        value: "21m00Tcm4TlvDq8ikWAM",
      },
      { label: "Drew (News, American Male)", value: "29vD33N1CtxCmqQRPOHJ" },
      {
        label: "Clyde (War veteran, American Male)",
        value: "2EiwWnXFnvU5JabPnv8n",
      },
      {
        label: "Paul (Ground reporter, American Male)",
        value: "5Q0t7uMcjvnagumLfvZi",
      },
      {
        label: "Domi (Strong, American Female)",
        value: "AZnzlk1XvdvUeBnXmlld",
      },
      { label: "Fin (Sailor, Irish Male)", value: "D38z5RcWu1voky8WS1ja" },
      { label: "Sarah (Soft, American Female)", value: "EXAVITQu4vr4xnSDxMaL" },
      {
        label: "Antoni (Well-rounded, American Male)",
        value: "ErXwobaYiN019PkySvjV",
      },
      { label: "Thomas (Calm, American Male)", value: "GBv7mTt0atIp3Br8iCZE" },
      {
        label: "Charlie (Casual, Australian Male)",
        value: "IKne3meq5aSn9XLyUdCD",
      },
      { label: "George (Raspy, British Male)", value: "JBFqnCBsd6RMkjVDRZzb" },
      { label: "Emily (Calm, American Female)", value: "LcfcDJNUP1GQjkvn1xUw" },
      {
        label: "Elli (Emotional, American Female)",
        value: "MF3mGyEYCl7XYWbV9V6O",
      },
      {
        label: "Callum (Intense, American Male)",
        value: "N2lVS1w4EtoT3dr4eOWO",
      },
      {
        label: "Patrick (Shouty, American Male)",
        value: "ODq5zmih8GrVes37Dizd",
      },
      {
        label: "Harry (Anxious, American Male)",
        value: "SOYHLrjzK2X1ezoPC6cr",
      },
      {
        label: "Liam (Articulate, American Male)",
        value: "TX3OmfQAAmAcNgGcgOSk",
      },
      {
        label: "Dorothy (Pleasant, British Female)",
        value: "ThT5KcBeYPX3keUQqHPh",
      },
      { label: "Josh (Deep, American Male)", value: "TxGEqnHWrfWFTfGW9XjX" },
      { label: "Arnold (Crisp, American Male)", value: "VR6AewLTigWG4xSOukaG" },
      {
        label: "Charlotte (Seductive, English-Swedish Female)",
        value: "XB0fDUnXU5pow04yAks0",
      },
      {
        label: "Matilda (Warm, American Female)",
        value: "XrExE9yKIg1WjnnRuSqN",
      },
      { label: "Matthew (Calm, British Male)", value: "Yko7PKHZNXotIFUBG7I9" },
      { label: "James (Calm, Australian Male)", value: "ZQe5CZNOzWyzPSCn5a3c" },
      { label: "Joseph (News, British Male)", value: "ZpFCEjqBiaekQjwkZpE" },
      {
        label: "Jeremy (Excited, American-Irish Male)",
        value: "bVMeCyTHy58xNoL34h3p",
      },
      { label: "Michael (Old, American Male)", value: "flq6f7yk4E4fJM5XTYuZ" },
      {
        label: "Ethan (Whisper, American Male)",
        value: "g5CIjZEefAph4nQFvHAz",
      },
      {
        label: "Gigi (Childish, American Female)",
        value: "jBpfuIE2acCO8z3wKNLl",
      },
      {
        label: "Freya (Overly emotional, American Female)",
        value: "jsCqWAovK2zIkigp7HKq",
      },
      {
        label: "Grace (Gentle, American-Southern Female)",
        value: "oWAxZDx7w5VEj9dCyTzz",
      },
      { label: "Daniel (Deep, British Male)", value: "onwK4e9ZLuTAKqWW03F9" },
      {
        label: "Serena (Pleasant, American Female)",
        value: "pMsXgVXv3BLzUgSXRplE",
      },
      { label: "Adam (Deep, American Male)", value: "pNInz6obpgDQGcFmaJgB" },
      {
        label: "Nicole (Whisper, American Female)",
        value: "piTKgcLEGmPE4e6mJCoi",
      },
      { label: "Jessie (Raspy, American Male)", value: "t0jbNlRYZCX6vjkpoirL" },
      { label: "Ryan (Soldier, American Male)", value: "wViXBPUzp2ZZixB1xQuM" },
      { label: "Sam (Raspy, American Male)", value: "yoZ06aMxZJJ28mfd3POQ" },
      {
        label: "Glinda (Witch, American Female)",
        value: "z9fAnlkpzviPz146aGWa",
      },
      {
        label: "Mimi (Childish, English-Swedish Female)",
        value: "zrHiDhphv9ZnVPUqCQEp",
      },
    ],
  },

  // Future providers can be added easily here following the same structure
//   openai: {
//     languages: [{ label: "English", value: "en" }],
//     voices: [
//       { label: "Alloy", value: "alloy", languageId: "en" },
//       { label: "Echo", value: "echo", languageId: "en" },
//       { label: "Fable", value: "fable", languageId: "en" },
//       { label: "Onyx", value: "onyx", languageId: "en" },
//       { label: "Nova", value: "nova", languageId: "en" },
//       { label: "Shimmer", value: "shimmer", languageId: "en" },
//     ],
//   },
};
