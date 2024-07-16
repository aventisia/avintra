namespace AspNetToolkit.Utils;

public static class GetEnumDescriptionUtil
{
    /// <summary>
    /// Extract description attributes value of enum value if it exists else sends back enum value as string
    /// </summary>
    /// <param name="enumValue"></param>
    /// <returns>Enum value description</returns>
    public static string GetEnumDescription(Enum enumValue)
    {
        // Get field info
        var fieldInfo = enumValue.GetType().GetField(enumValue.ToString());

        // Get description attribute
        var attributes = fieldInfo?.GetCustomAttributes(typeof(DescriptionAttribute), false);

        // If description attribute exists
        if (attributes?.Length > 0) return ((DescriptionAttribute)attributes[0]).Description;

        // Return enum name as fallback
        return enumValue.ToString();
    }
}