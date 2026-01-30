namespace AspNetToolkit.Utils;

public static class HelperUtil
{
    public static string GenerateRandomPassword(int pwdLength = 8)
    {
        // Character sets
        const string U = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string L = "abcdefghijklmnopqrstuvwxyz";
        const string N = "0123456789";
        const string S = "!@#$%^&*";
        const string A = U + L + N + S;

        // Allocate password buffer on the stack (fast, no heap allocation)
        Span<char> password = stackalloc char[pwdLength];

        // Ensure at least one character from each required set
        if (pwdLength >= 4)
        {
            password[0] = U[RandomNumberGenerator.GetInt32(U.Length)];
            password[1] = L[RandomNumberGenerator.GetInt32(L.Length)];
            password[2] = N[RandomNumberGenerator.GetInt32(N.Length)];
            password[3] = S[RandomNumberGenerator.GetInt32(S.Length)];
        }

        // Fill remaining characters randomly from all sets
        for (int i = 4; i < pwdLength; i++)
        {
            password[i] = A[RandomNumberGenerator.GetInt32(A.Length)];
        }

        // Convert Span<char> to string and return
        return new string(password);
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