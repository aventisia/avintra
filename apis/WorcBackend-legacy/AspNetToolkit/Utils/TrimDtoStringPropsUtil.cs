namespace AspNetToolkit.Utils;

public static class TrimDtoStringPropsUtil
{
    /// <summary>
    /// Trims all string props of a dto
    /// </summary>
    /// <param name="dto">Dto which string props needs to be trimmed</param>
    /// <returns>Dto with trimmed string props</returns>
    public static TDto TrimDtoStringProps<TDto>(this TDto dto) where TDto : class
    {
        try
        {
            // Get props
            var props = typeof(TDto).GetProperties(BindingFlags.Public | BindingFlags.Instance);

            // Loop through props
            foreach (var prop in props)
            {
                // If prop is a string
                if (prop.PropertyType != typeof(string)) continue;

                // Get prop value
                var value = prop.GetValue(dto) as string;

                // If value is null or empty
                if (string.IsNullOrEmpty(value)) continue;

                // Trim prop value
                prop.SetValue(dto, value?.Trim());
            }

            // Return formatted dto
            return dto;
        }
        catch
        {
        }
        return dto;
    }
}