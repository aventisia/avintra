using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    // Activity: Write XML to File
    [DisplayName("Write XML to File")]
    [Description("Writes the contents of an XML node variable into a file.")]
    public class WriteXmlToFileActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The XML content to write.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The path to the output XML file.")]
        public InArgument<string> FilePath { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var xmlContent = XmlContent.Get(context);
            var filePath = FilePath.Get(context);
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(xmlContent))
                {
                    throw new ArgumentException("XML content cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(filePath))
                {
                    throw new ArgumentException("File path cannot be null or empty.");
                }

                File.WriteAllText(filePath, xmlContent);
                StatusMessage.Set(context, "XML written successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error writing XML file: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}