using NodeLibrary.XmlNodes.Enums;
using System.Xml;

namespace NodeLibrary.XmlNodes;

[DisplayName("Read XML from File"), Description("Reads the contents of an XML file into a variable.")]
[NodeMetadata(icon: "/assets/XML.svg")]
public class ReadXmlFromFileNode : BaseNode
{
    [DisplayName("File Path"), Description("The path to the XML file.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Encoding Type"), Description("Specifies the encoding to use for reading the XML file.")]
    public InArgument<XmlFileEncodingEnum> EncodingType { get; set; } = new InArgument<XmlFileEncodingEnum>(XmlFileEncodingEnum.SystemDefault);

    [DisplayName("XML Document Loaded"), Description("Returns the parsed XmlDocument object if the XML file was successfully read and parsed.")]
    public OutArgument<XmlDocument> XmlDocument { get; set; } = new OutArgument<XmlDocument>();

    protected override void Execute(INodeContext context)
    {
        var status = "XML file read and parsed successfully.";

        try
        {
            var filePath = FilePath.Get(context);
            var encodingType = EncodingType.Get(context);

            if (string.IsNullOrEmpty(filePath))
                throw new ArgumentException("File path cannot be null or empty.");

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"XML file not found at path: {filePath}");

            var xmlContent = File.ReadAllText(filePath, GetEncoding(encodingType));
            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(xmlContent);

            XmlDocument.Set(context, xmlDoc);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error reading XML file: {ex.Message}");
        }
    }

    private static Encoding GetEncoding(XmlFileEncodingEnum encodingType)
    {
        return encodingType switch
        {
            XmlFileEncodingEnum.SystemDefault => Encoding.Default,
            XmlFileEncodingEnum.UTF8 => Encoding.UTF8,
            XmlFileEncodingEnum.Unicode => Encoding.Unicode,
            XmlFileEncodingEnum.BigEndianUnicode => Encoding.BigEndianUnicode,
            XmlFileEncodingEnum.UTF8NoBOM => new UTF8Encoding(false),
            XmlFileEncodingEnum.ASCII => Encoding.ASCII,
            _ => throw new ArgumentException($"Unsupported encoding type: {encodingType}")
        };
    }
}
