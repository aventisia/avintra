namespace MLModelBuilderAPIs.Dtos
{
    public class OllamaRequestDto
    {
        public required string ModelName { get; set; }
        public required string InputData { get; set; }
        public required string ApiKey { get; set; }
    }
}