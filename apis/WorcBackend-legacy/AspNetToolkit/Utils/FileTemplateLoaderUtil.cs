namespace AspNetToolkit.Utils;

public static class FileTemplateLoaderUtil
{
    /// <summary>
    /// Loads a text file from the 'StaticFiles/PromptTemplates' directory 
    /// and replaces placeholders in the format "{{Key}}" with the provided values.
    /// </summary>
    /// <param name="fileName">The name of the file to load.</param>
    /// <param name="placeholderValues">A dictionary of placeholder keys and their replacement values.</param>
    /// <returns>The rendered content with placeholders replaced, or an empty string if the file doesn't exist or an error occurs.</returns>
    public static string LoadAndRenderFile(string fileName, Dictionary<string, string> placeholderValues)
    {
        try
        {
            // Combine the current directory with the subdirectory path to locate the template directory
            string templateDirectory = Path.Combine(Directory.GetCurrentDirectory(), "StaticFiles", "PromptTemplates");

            // Build the full file path for the requested template
            string fullPath = Path.Combine(templateDirectory, fileName);

            // Create a FileInfo object to interact with file system metadata
            var templateFile = new FileInfo(fullPath);

            // If the file doesn't exist, return an empty string
            if (!templateFile.Exists)
            {
                return string.Empty;
            }

            // Read the entire content of the file into a string
            string content = File.ReadAllText(templateFile.FullName);

            // Loop through each key-value pair in the placeholder dictionary
            foreach (var entry in placeholderValues)
            {
                // Replace all instances of the placeholder (e.g., "{{Key}}") with the corresponding value
                content = content.Replace(entry.Key, entry.Value);
            }

            // Return the processed content with placeholders replaced
            return content;
        }
        catch
        {
            // If any exception occurs (e.g., IO errors), return an empty string
            // In production, you should log the exception for debugging purposes
            return string.Empty;
        }
    }
}