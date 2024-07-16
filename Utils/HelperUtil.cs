namespace AspNetToolkit.Utils;

public static class HelperUtil
{
    public static string GenerateRandomPassword(int pwdLength = 8)
    {
        const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-+";
        StringBuilder password = new StringBuilder();
        Random rnd = new Random();
        for (int i = 0; i < pwdLength; i++)
        {
            password.Append(validChars[rnd.Next(validChars.Length)]);
        }
        return password.ToString();
    }

    public static string GetFirstNameFromFullName(string input)
    {
        string firstName = "";
        try
        {
            string[] splitContent = input.Split(' ');
            firstName = splitContent[0].Trim();
        }
        catch
        {
            firstName = "";
        }
        return firstName;
    }
    public static bool IsGuid(string value)
    {
        bool result = false;
        try
        {
            Guid x;
            result = Guid.TryParse(value, out x);
        }
        catch
        {
            return false;
        }
        return result;
    }

    public static string MaskString(string inputString, string maskedChar = "*",
        int visibleStartStringCount = 2, int visibleEndStringCount = 2)
    {
        string maskedString = "";
        try
        {
            if (!string.IsNullOrWhiteSpace(inputString))
            {
                if (inputString.Length >= ((visibleStartStringCount + visibleEndStringCount) * 2))
                {
                    // Create start part
                    string start = inputString.Substring(0, visibleStartStringCount);
                    // Create middle part
                    string middle = "";
                    for (int i = 1; i <= (inputString.Length - (visibleStartStringCount + visibleEndStringCount)); i++)
                    {
                        middle = middle + maskedChar;
                    }
                    // Create end part
                    string end = inputString.Substring(inputString.Length - visibleEndStringCount, visibleEndStringCount);
                    // Create final masked string 
                    maskedString = start + middle + end;
                }
                else
                {
                    for (int i = 1; i <= inputString.Length; i++)
                    {
                        maskedString = maskedString + "*";
                    }
                }
            }
        }
        catch
        {
            return maskedString;
        }
        return maskedString;
    }

    public static string MaskGuid(string inputGuid)
    {
        string maskedGuid = "";
        try
        {
            maskedGuid = inputGuid.Substring(0, 5) + "XXX-XXXX-XXXX-XXXX-XXXXXXX" + inputGuid.Substring(31, 5);
        }
        catch
        {
            return maskedGuid;
        }
        return maskedGuid;
    }
}