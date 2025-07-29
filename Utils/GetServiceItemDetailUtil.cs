namespace AspNetToolkit.Utils;

public static class GetServiceItemDetailUtil
{
    // Static list of available service items
    // Static list of available service items with their icons
    private static readonly List<ServiceItemDto> _serviceItems = new()
    {
        new ServiceItemDto { DisplayName = "deepseek-r1", Name = "deepseek-r1:7b", IconSrc = "brand-img/deepseek-r1.svg" },
        new ServiceItemDto { DisplayName = "phi4", Name = "phi4:14b", IconSrc = "brand-img/phi-4.svg" },
        new ServiceItemDto { DisplayName = "llama3.1", Name = "llama3.1:8b", IconSrc = "brand-img/llama-3.1.svg" },
        new ServiceItemDto { DisplayName = "llama3.2", Name = "llama3.2:3b", IconSrc = "brand-img/llama-3.2.svg" },
        new ServiceItemDto { DisplayName = "mistral", Name = "mistral:7b", IconSrc = "brand-img/mistral.svg" },
        new ServiceItemDto { DisplayName = "gemma", Name = "gemma:7b", IconSrc = "brand-img/gemma.svg" },
        new ServiceItemDto { DisplayName = "drive", Name = "drive", IconSrc = "brand-img/drive.svg" },
        new ServiceItemDto { DisplayName = "one_drive", Name = "one_drive", IconSrc = "brand-img/one_drive.svg" },
        new ServiceItemDto { DisplayName = "aws", Name = "aws", IconSrc = "brand-img/aws.svg" },
        new ServiceItemDto { DisplayName = "azure", Name = "azure", IconSrc = "brand-img/azure.svg" }
    };

    // Get service items by their display names
    public static List<ServiceItemDto> GetItemsByDisplayNames(List<string> displayNames)
    {
        return _serviceItems
            .Where(item => displayNames.Contains(item.DisplayName))
            .ToList();
    }

    // Get icons (IconSrc) for the items by their display names
    public static List<string> GetIconsByDisplayNames(List<string> displayNames)
    {
        return _serviceItems
            .Where(item => displayNames.Contains(item.DisplayName))
            .Select(s => s.IconSrc ?? string.Empty)
            .Distinct()
            .ToList();
    }
}
