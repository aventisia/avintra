namespace AspNetToolkit.Attributes;


// This class combines both the ConfidentialAttribute and the SecretPropertyEncryptor logic.
public static class SecretPropertyEncryptor
{
    // The ConfidentialAttribute is nested inside the SecretPropertyEncryptor class
    // It serves as a marker for properties that need encryption/decryption
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
    public class ConfidentialAttribute : Attribute
    {
        // Empty class since it serves as a marker for confidential properties
    }

    /// <summary>
    /// Encrypts string properties marked with [Encrypted] in the given DTO and returns them as key-value pairs.
    /// </summary>
    /// <typeparam name="TDto">Type of the input DTO</typeparam>
    /// <param name="dto">DTO instance with plain-text values</param>
    /// <param name="encryptionService">Encryption service to encrypt property values</param>
    /// <returns>List of KeyValue objects containing encrypted property names and values</returns>
    public static List<KeyValueDto> EncryptToKeyValues<TDto>(TDto dto, IStringEncryptionService encryptionService)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        var encryptedKeyValues = new List<KeyValueDto>();
        var dtoType = dto.GetType();

        var dtoProperties = dtoType.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.FlattenHierarchy);

        foreach (var property in dtoProperties)
        {
            // Process only readable, writable string properties marked with [Encrypted]
            if (!property.CanRead || !property.CanWrite) continue;
            if (property.PropertyType != typeof(string)) continue;
            if (!Attribute.IsDefined(property, typeof(ConfidentialAttribute))) continue;

            var plainTextValue = (string?)property.GetValue(dto);
            if (string.IsNullOrEmpty(plainTextValue)) continue;

            try
            {
                var encryptedValue = encryptionService.EncryptString(plainTextValue);

                encryptedKeyValues.Add(new KeyValueDto()
                {
                    Name = property.Name,
                    Value = encryptedValue
                });
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"Error encrypting property '{property.Name}' on DTO type '{dtoType.FullName}'.", ex);
            }
        }

        return encryptedKeyValues;
    }

    /// <summary>
    /// Decrypts a list of KeyValue pairs and maps the values back to a new DTO instance.
    /// Only applies to string properties marked with [Encrypted].
    /// </summary>
    /// <typeparam name="TDto">Type of the DTO to create and populate</typeparam>
    /// <param name="encryptedKeyValues">List of encrypted KeyValue objects</param>
    /// <param name="encryptionService">Encryption service to decrypt values</param>
    /// <returns>A new DTO instance with decrypted values assigned to matching properties</returns>
    public static TDto DecryptKeyValuesToDto<TDto>(List<KeyValueDto> encryptedKeyValues, IStringEncryptionService encryptionService)
        where TDto : new()
    {
        if (encryptedKeyValues == null) throw new ArgumentNullException(nameof(encryptedKeyValues));

        var dtoInstance = new TDto();
        var dtoType = typeof(TDto);

        var dtoProperties = dtoType.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.FlattenHierarchy);

        foreach (var keyValuePair in encryptedKeyValues)
        {
            if (string.IsNullOrEmpty(keyValuePair.Name) || string.IsNullOrEmpty(keyValuePair.Value))
                continue;

            var matchingProperty = dtoProperties.FirstOrDefault(property =>
                property.Name.Equals(keyValuePair.Name, StringComparison.OrdinalIgnoreCase) &&
                Attribute.IsDefined(property, typeof(ConfidentialAttribute)) &&
                property.CanWrite &&
                property.PropertyType == typeof(string));

            if (matchingProperty == null) continue;

            try
            {
                var decryptedValue = encryptionService.DecryptString(keyValuePair.Value);
                matchingProperty.SetValue(dtoInstance, decryptedValue);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"Error decrypting value for property '{keyValuePair.Name}' on DTO type '{dtoType.FullName}'.", ex);
            }
        }

        return dtoInstance;
    }


    // Encrypt properties that are marked with ConfidentialAttribute
    public static void EncryptSecretProperties<T>(T dto, IStringEncryptionService stringEncryptionService)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        ProcessSecretProperties(dto, stringEncryptionService, encrypt: true);
    }

    // Decrypt properties that are marked with ConfidentialAttribute
    public static void DecryptSecretProperties<T>(T dto, IStringEncryptionService stringEncryptionService)
    {
        if (dto == null) throw new ArgumentNullException(nameof(dto));
        ProcessSecretProperties(dto, stringEncryptionService, encrypt: false);
    }

    // Process the confidential properties for encryption or decryption
    private static void ProcessSecretProperties(object dto, IStringEncryptionService stringEncryptionService, bool encrypt)
    {
        var type = dto.GetType();
        var props = type.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.FlattenHierarchy);

        foreach (var prop in props)
        {
            // Check if the property is readable and writable
            if (!prop.CanRead || !prop.CanWrite) continue;

            // Only process properties of type string
            if (prop.PropertyType != typeof(string)) continue;

            // Check if the property has the ConfidentialAttribute applied
            if (!Attribute.IsDefined(prop, typeof(ConfidentialAttribute))) continue;

            string? value = (string?)prop.GetValue(dto);
            if (string.IsNullOrEmpty(value)) continue;

            try
            {
                // Encrypt or decrypt based on the 'encrypt' flag
                string processedValue = encrypt
                    ? stringEncryptionService.EncryptString(value)
                    : stringEncryptionService.DecryptString(value);

                // Set the processed value (encrypted or decrypted) back to the property
                prop.SetValue(dto, processedValue);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"Error {(encrypt ? "encrypting" : "decrypting")} property '{prop.Name}' " +
                    $"on DTO type '{type.FullName}'.", ex);
            }
        }
    }
}