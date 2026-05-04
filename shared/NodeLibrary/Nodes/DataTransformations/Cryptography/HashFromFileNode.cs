using NodeLibrary.CryptographyNodes.Enums;
using System.Security.Cryptography;

namespace NodeLibrary.CryptographyNodes;

[DisplayName("Hash from File"), Description("Hash the contents of a file, using a specified algorithm")]
[NodeMetadata(icon: "/assets/Cryptography.svg")]
public class HashFromFileNode : BaseNode
{
    [DisplayName("File Path to Hash"), Description("The path to the file you want to hash")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Hashing Algorithm"), Description("The algorithm to use for hashing (SHA256, SHA512, or MD5)")]
    public required InArgument<HashAlgorithmEnum> Algorithm { get; set; }

    [DisplayName("Hashed File Content"), Description("The hashed content of the file")]
    public OutArgument<string> HashedContent { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var filePath = FilePath.Get(context);
        var algorithm = Algorithm.Get(context);

        try
        {
            var fileContent = File.ReadAllText(filePath);
            var contentBytes = Encoding.UTF8.GetBytes(fileContent);
            var hashedBytes = HashData(contentBytes, algorithm);
            var hashedContent = ByteArrayToHexString(hashedBytes);

            HashedContent.Set(context, hashedContent);
            status = "File hashed successfully.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            HashedContent.Set(context, null!);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error hashing file: {ex.Message}");
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
