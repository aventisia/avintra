namespace AspNetToolkit.Utils;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Schema;

public static class JsonStringExtensions
{
    /// <summary>
    /// Validates that a JSON array string contains objects matching the structure of a sample JSON object.
    /// All values are treated as strings.
    /// </summary>
    public static bool ValidateJsonArrayWithFromShema(this string sampleJsonObject, string jsonArray, out List<string> errors)
    {
        if (string.IsNullOrWhiteSpace(sampleJsonObject))
            throw new ArgumentException("Sample JSON object cannot be null or empty.", nameof(sampleJsonObject));

        if (string.IsNullOrWhiteSpace(jsonArray))
            throw new ArgumentException("JSON array cannot be null or empty.", nameof(jsonArray));

        errors = [];

        try
        {
            // Parse sample object
            JObject sampleObj = JObject.Parse(sampleJsonObject);

            // Generate schema dynamically where all properties are strings
            JSchema schema = GenerateStringSchema(sampleObj);

            // Parse array
            JArray array = JArray.Parse(jsonArray);

            // Validate each item in the array
            foreach (var item in array)
            {
                if (item is not JObject obj)
                {
                    errors.Add("Item is not a valid JSON object.");
                    continue;
                }

                if (!obj.IsValid(schema, out IList<string> itemErrors))
                {
                    errors.AddRange(itemErrors);
                }
            }

            return errors.Count == 0;
        }
        catch (Exception ex)
        {
            errors.Add($"Error parsing JSON: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Generates a schema where all properties are strings
    /// </summary>
    private static JSchema GenerateStringSchema(JObject obj)
    {
        JSchema schema = new JSchema
        {
            Type = JSchemaType.Object
        };

        foreach (var prop in obj.Properties())
        {
            schema.Properties.Add(prop.Name, new JSchema { Type = JSchemaType.String });
        }

        return schema;
    }


    /// <summary>
    /// Validates and joins two JSON arrays if both are valid against a sample object.
    /// </summary>
    public static string? ValidateAndJoinJsonArrays(this string sampleObject,
        string jsonArray1,
        string jsonArray2,
        out List<string> combinedErrors)
    {
        combinedErrors = [];

        // Validate first array
        bool isValid1 = sampleObject.ValidateJsonArrayWithFromShema(jsonArray1, out var errors1);
        combinedErrors.AddRange(errors1);

        // Validate second array
        bool isValid2 = sampleObject.ValidateJsonArrayWithFromShema(jsonArray2, out var errors2);
        combinedErrors.AddRange(errors2);

        if (!isValid1 || !isValid2)
        {
            return null; // One or both arrays invalid
        }

        // Parse arrays
        JArray array1 = JArray.Parse(jsonArray1);
        JArray array2 = JArray.Parse(jsonArray2);

        // Combine arrays
        JArray combined = new(array1.Concat(array2));

        return combined.ToString(Formatting.None);
    }

}