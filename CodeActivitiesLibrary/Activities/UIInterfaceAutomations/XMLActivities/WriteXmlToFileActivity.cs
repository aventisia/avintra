using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.XmlActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Text;
using System.Xml;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.XmlActivities
{
    [DisplayName("Write XML to File")]
    [Description("Writes the contents of an XML node or string into a file.")]
    [ActivityMetaData(nodeType: "activityNode", nodeIcon: null, nodeImg: "/assets/XML.svg")]
    public class WriteXmlToFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The path to the file where the XML will be written.")]
        public InArgument<string> FilePath { get; set; }

        [RequiredArgument]
        [DisplayName("XML To Write")]
        [Description("The XML string to write into the file.")]
        public InArgument<string> XmlToWrite { get; set; }

        [DisplayName("Encoding Type")]
        [Description("Encoding to use when writing the file.")]
        public InArgument<XmlFileEncodingEnum> EncodingType { get; set; }

        [DisplayName("Format XML")]
        [Description("Whether to format (indent) the XML output.")]
        public InArgument<bool> FormatXml { get; set; }

        [DisplayName("Indentation Per Level")]
        [Description("Number of spaces to use for indentation if formatting is enabled.")]
        public InArgument<int> IndentationPerLevel { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var xmlContent = XmlToWrite.Get(context);
            var encodingType = EncodingType.Get(context);
            var formatXml = FormatXml.Get(context);
            var indentation = IndentationPerLevel.Get(context);
            try
            {
                if (string.IsNullOrWhiteSpace(filePath))
                    throw new ArgumentException("File path cannot be null or empty.");

                if (string.IsNullOrWhiteSpace(xmlContent))
                    throw new ArgumentException("XML content cannot be null or empty.");

                var encoding = GetEncoding(encodingType);

                using (var stream = new StreamWriter(filePath, false, encoding))
                {
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

                        using (var writer = XmlWriter.Create(stream, settings))
                        {
                            xmlDoc.Save(writer);
                        }
                    }
                    else
                    {
                        stream.Write(xmlContent);
                    }
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "XML written successfully to file.");

            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error writing XML to file: {ex.Message}");
            }
        }

        private Encoding GetEncoding(XmlFileEncodingEnum type)
        {
            switch (type)
            {
                case XmlFileEncodingEnum.SystemDefault:
                    return Encoding.Default;
                case XmlFileEncodingEnum.UTF8:
                    return Encoding.UTF8;
                case XmlFileEncodingEnum.Unicode:
                    return Encoding.Unicode;
                case XmlFileEncodingEnum.BigEndianUnicode:
                    return Encoding.BigEndianUnicode;
                case XmlFileEncodingEnum.UTF8NoBOM:
                    return new UTF8Encoding(false);
                case XmlFileEncodingEnum.ASCII:
                    return Encoding.ASCII;
                default:
                    return Encoding.Default;
            }
        }
    }
}