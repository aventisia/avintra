class LLMService:
    async def extract_data(self, prompt: str, model: str, temperature: float):
        # Mock LLM response
        return {"Data": f"Answer to: {prompt}"}
