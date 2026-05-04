using NodeLibrary.CryptographyNodes.Enums;
using System.Security.Cryptography;

namespace NodeLibrary.CryptographyNodes;

[DisplayName("Hash Text with Key"), Description("Hash a string with a key, using a specified algorithm")]
[NodeMetadata(icon: "/assets/Cryptography.svg")]
public class HashTextWithKeyNode : BaseNode
{
    [DisplayName("Text to Hash"), Description("The text you want to hash")]
    public required InArgument<string> Text { get; set; }

    [DisplayName("Key to Use"), Description("The key to use in hashing")]
    public required InArgument<string> Key { get; set; }

    [DisplayName("Hashing Algorithm"), Description("The algorithm to use for hashing (SHA256, SHA512, or MD5)")]
    public required InArgument<HashAlgorithmEnum> Algorithm { get; set; }

    [DisplayName("Hashed Text"), Description("The hashed text")]
    public OutArgument<string> HashedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var text = Text.Get(context);
        var key = Key.Get(context);
        var algorithm = Algorithm.Get(context);

        try
        {
            var combinedContent = text + key;
            var contentBytes = Encoding.UTF8.GetBytes(combinedContent);
            var hashedBytes = HashData(contentBytes, algorithm);
            var hashedText = ByteArrayToHexString(hashedBytes);

            HashedText.Set(context, hashedText);
            status = "Text hashed successfully.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            HashedText.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error hashing text with key: {ex.Message}");
        }
    }

    private static byte[] HashData(byte[] data, HashAlgorithmEnum algorithm)
    {
        return algorithm switch
        {
            HashAlgorithmEnum.Sha256 => SHA256.HashData(data),
            HashAlgorithmEnum.Sha512 => SHA512.HashData(data),
            HashAlgorithmEnum.Md5 => MD5.HashData(data),
            _ => throw new ArgumentException("Invalid algorithm")
        };
    }

    private static string ByteArrayToHexString(byte[] bytes)
    {
        var sb = new StringBuilder();
        foreach (var b in bytes)
            sb.Append(b.ToString("x2"));

        return sb.ToString();
    }
}
