export interface ILLMConfiguration {
    configurationType: "OnPrem" | "Cloud",
    llm: string,
    nodePrompt: string,
    temperature: number,
}