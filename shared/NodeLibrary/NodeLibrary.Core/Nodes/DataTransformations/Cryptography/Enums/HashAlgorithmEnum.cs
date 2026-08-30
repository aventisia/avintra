namespace NodeLibrary.CryptographyNodes.Enums;

public enum HashAlgorithmEnum
{
    [Display(Name = "MD5", Description = "MD5 hashing algorithm")]
    Md5 = 0,

    [Display(Name = "SHA256", Description = "SHA-256 hashing algorithm")]
    Sha256 = 1,

    [Display(Name = "SHA512", Description = "SHA-512 hashing algorithm")]
    Sha512 = 2
}
