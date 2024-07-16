namespace AspNetToolkit.Utils;

public static class CapitalizeFirstLetterUtil
{
    /// <summary>
    /// Convert first char of input string to uppsercase
    /// </summary>
    /// <param name="input">Any text</param>
    /// <returns>Formatted string or return input string without formatted if there is any errro</returns>
    public static string CapitalizeFirstLetter(string input)
    {
        try
        {
            // If null or whitespace
            if (string.IsNullOrWhiteSpace(input)) return input;

            // Trim input
            input = input.Trim();

            // Convert whole string to lowercase
            input = input.ToLower();

            // If single char input
            if (input.Length == 1)
                return char.ToUpper(input[0]).ToString();

            // If multi char input
            else
                return char.ToUpper(input[0]) + input.Substring(1);
        }
        catch
        {
            return input;
        }
    }
}