using NodeLibrary.XmlNodes.Enums;
using System.Xml;

namespace NodeLibrary.XmlNodes;

[DisplayName("Write XML to File"), Description("Writes the contents of an XML node or string into a file.")]
[NodeMetadata(icon: "/assets/XML.svg")]
public class WriteXmlToFileNode : BaseNode
{
    [DisplayName("File Path"), Description("The path to the file where the XML will be written.")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("XML To Write"), Description("The XML string to write into the file.")]
    public required InArgument<string> XmlToWrite { get; set; }

    [DisplayName("Encoding Type"), Description("Encoding to use when writing the file.")]
    public InArgument<XmlFileEncodingEnum> EncodingType { get; set; } = new InArgument<XmlFileEncodingEnum>(XmlFileEncodingEnum.SystemDefault);

    [DisplayName("Format XML"), Description("Whether to format (indent) the XML output.")]
    public InArgument<bool> FormatXml { get; set; } = new InArgument<bool>(false);

    [DisplayName("Indentation Per Level"), Description("Number of spaces to use for indentation if formatting is enabled.")]
    public InArgument<int> IndentationPerLevel { get; set; } = new InArgument<int>(2);

    protected override void Execute(INodeContext context)
    {
        var status = "XML written successfully to file.";

        try
        {
            var filePath = FilePath.Get(context);
            var xmlContent = XmlToWrite.Get(context);
            var encodingType = EncodingType.Get(context);
            var formatXml = FormatXml.Get(context);
            var indentation = IndentationPerLevel.Get(context);

            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path cannot be null or empty.");

            if (string.IsNullOrWhiteSpace(xmlContent))
                throw new ArgumentException("XML content cannot be null or empty.");

            var encoding = GetEncoding(encodingType);

            using var stream = new StreamWriter(filePath, false, encoding);
            if (formatXml)
            {
                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var settings = new XmlWriterSettings
                {
                    Indent = true,
                    IndentChars = new string(' ', indentation > 0 ? indentation : 2),
                    Encoding = encoding,
                    OmitXmlDeclaration = false,
                    NewLineOnAttributes = false
                };

                using var writer = XmlWriter.Create(stream, settings);
                xmlDoc.Save(writer);
            }
            else
            {
                stream.Write(xmlContent);
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error writing XML to file: {ex.Message}");
        }
    }

    private static Encoding GetEncoding(XmlFileEncodingEnum type)
    {
        return type switch
        {
            XmlFileEncodingEnum.SystemDefault => Encoding.Default,
            XmlFileEncodingEnum.UTF8 => Encoding.UTF8,
            XmlFileEncodingEnum.Unicode => Encoding.Unicode,
            XmlFileEncodingEnum.BigEndianUnicode => Encoding.BigEndianUnicode,
            XmlFileEncodingEnum.UTF8NoBOM => new UTF8Encoding(false),
            XmlFileEncodingEnum.ASCII => Encoding.ASCII,
            _ => Encoding.Default
        };
    }
}
