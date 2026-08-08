namespace AccountsAPIs.DTOs;

public class DownloadManifestDto
{
    public ProductManifestDto Desktop { get; set; } = new();
    public ProductManifestDto Runner { get; set; } = new();
}

public class ProductManifestDto
{
    public List<ProductVersionDto> Versions { get; set; } = new();
}

public class ProductVersionDto
{
    public string Version { get; set; } = string.Empty;
    public string Notes { get; set; } = "Bug fixes and improvements.";
    public List<ArtifactDto> Artifacts { get; set; } = new();
}

public class ArtifactDto
{
    public string Platform { get; set; } = string.Empty; // windows, linux, macos
    public string Architecture { get; set; } = string.Empty; // x86_64, arm64
    public string Url { get; set; } = string.Empty;
    public long? Size { get; set; }
    public string? InstallerType { get; set; } // nsis, zip, dmg, appimage
    public bool Available { get; set; }
    public string? SignatureUrl { get; set; }
}
