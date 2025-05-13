namespace AspNetToolkit.Utils;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Schema;

public static class JsonValidationExtensions
{
    /// <summary>
    /// Validates a JObject (JSON object) against the provided schema.
    /// <code>
    /// string schemaJson = @"
    ///{
    ///  ""type"": ""object"",
    ///  ""properties"": {
    ///    ""name"": { ""type"": ""string"" },
    ///    ""age"": { ""type"": ""number"" }
    ///  },
    ///  ""required"": [""name""]
    ///}";
    ///var schema = JSchema.Parse(schemaJson);
    ///
    ///var obj = JObject.Parse(json);
    ///bool isValidObj = obj.Validate(schema, out var objErrors);
    /// </code>
    /// </summary>
    public static bool ValidateJsonObject(this JObject obj, JSchema schema, out List<string> errorMessages)
    {
        ArgumentNullException.ThrowIfNull(obj);
        ArgumentNullException.ThrowIfNull(schema);

        return ValidateCore(obj, schema, out errorMessages);
    }

    /// <summary>
    /// Validates a JArray (JSON array) against the provided schema.
    /// <code>
    ///    string arraySchemaJson = @"
    ///{
    ///  ""type"": ""array"",
    ///  ""items"": {
    ///    ""type"": ""object"",
    ///    ""properties"": {
    ///      ""name"": { ""type"": ""string"" },
    ///      ""age"": { ""type"": ""number"" }
    ///    },
    ///    ""required"": [""name""]
    ///}
    ///}";
    ///
    ///var arraySchema = JSchema.Parse(arraySchemaJson);
    ///var array = JArray.Parse(jsonArray);
    ///bool isValidArray = array.Validate(arraySchema, out var arrayErrors);
    /// </code>
    /// </summary>
    public static bool ValidateJsonArray(this JArray array, JSchema schema, out List<string> errorMessages)
    {
        ArgumentNullException.ThrowIfNull(array);
        ArgumentNullException.ThrowIfNull(schema);

        return ValidateCore(array, schema, out errorMessages);
    }

    /// <summary>
    /// Internal validation logic reused by both JObject and JArray.
    /// </summary>
    private static bool ValidateCore(JToken token, JSchema schema, out List<string> errorMessages)
    {
        errorMessages = [];
        bool isValid = token.IsValid(schema, out IList<string> messages);

        if (messages != null)
        {
            errorMessages.AddRange(messages);
        }

        return isValid;
    }
}