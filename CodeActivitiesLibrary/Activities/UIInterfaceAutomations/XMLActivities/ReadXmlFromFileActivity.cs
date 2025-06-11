using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Text;
using System.Xml;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    // Activity: Read XML from File
    [DisplayName("Read XML from File")]
    [Description("Reads the contents of an XML file into a variable.")]
    public class ReadXmlFromFileActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("File Path")]
        [Description("The path to the XML file.")]
        public InArgument<string> FilePath { get; set; }

        [DefaultValue(XmlFileEncodingEnum.SystemDefault)]
        [DisplayName("Encoding Type")]
        [Description("Specifies the encoding to use for reading the XML file.")]
        public InArgument<XmlFileEncodingEnum> EncodingType { get; set; }

        [DisplayName("XML Document Loaded")]
        [Description("Returns true if the XML file was successfully read and parsed, false otherwise.")]
        public OutArgument<bool> XmlDocument { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            var encodingType = EncodingType.Get(context);

            var success = false;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(filePath)) throw new ArgumentException("File path cannot be null or empty.");

                if (!File.Exists(filePath)) throw new FileNotFoundException($"XML file not found at path: {filePath}");

                // Map the enum value to the corresponding encoding
                var encoding = GetEncoding(encodingType);

                // Read the XML file with the specified encoding
                var xmlContent = File.ReadAllText(filePath, encoding);

                // Parse the XML content into an XmlDocument
                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                success = true;
                StatusMessage.Set(context, "XML file read and parsed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error reading XML file: {ex.Message}";
            }

            XmlDocument.Set(context, success);
            StatusMessage.Set(context, status);
        }

        private static Encoding GetEncoding(XmlFileEncodingEnum encodingType)
        {
            switch (encodingType)
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
                    return new UTF8Encoding(false); // false means no BOM
                case XmlFileEncodingEnum.ASCII:
                    return Encoding.ASCII;
                default:
                    throw new ArgumentException($"Unsupported encoding type: {encodingType}");
            }
        }
    }
}