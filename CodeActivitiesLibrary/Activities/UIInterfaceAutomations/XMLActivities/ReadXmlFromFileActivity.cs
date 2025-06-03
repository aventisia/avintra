using System;
using System.Activities;
using System.ComponentModel;
using System.IO;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    // Activity: Read XML from File
    [DisplayName("Read XML from File")]
    [Description("Reads the contents of an XML file into a variable.")]
    public class ReadXmlFromFileActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The path to the XML file.")]
        public InArgument<string> FilePath { get; set; }


        [Description("Returns the XML content as a string.")]
        public OutArgument<string> XmlContent { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var filePath = FilePath.Get(context);
            string xmlContent = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(filePath)) throw new ArgumentException("File path cannot be null or empty.");

                xmlContent = File.ReadAllText(filePath);
                StatusMessage.Set(context, "XML read successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error reading XML file: {ex.Message}";
            }

            XmlContent.Set(context, xmlContent);
            StatusMessage.Set(context, status);
        }
    }
}