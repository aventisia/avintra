using System;

namespace CodeActivitiesLibrary.Extensions
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public class ActivityMetaDataAttribute : Attribute
    {
        public string NodeType { get; }
        public string Version { get; }
        public string Author { get; }

        /// <summary>
        /// Possible values (one or more separated by comma): "desktop", "cloud", "cloud,desktop"
        /// </summary>
        public string SupportedPlatforms { get; }

        /// <summary>
        /// Possible value (single value): "standard", "none"
        /// </summary>
        public string ErrorHandling { get; }

        /// <summary>
        /// Possible value (single value): "standard", "none", "llmGenerateRequest"
        /// </summary>
        public string TestScreenType { get; set; }
        public string NodeIcon { get; }
        public string NodeImg { get; }
        public string DocsLink { get; }

        public ActivityMetaDataAttribute(string nodeType = "activityNode",
            string version = "1.0.0",
            string author = "@aventisia",
            string supportedPlatforms = "desktop",
            string errorHandling = "standard",
            string testScreenType = "standard",
            string nodeIcon = null,
            string nodeImg = "/function.png",
            string docsLink = "https://docs.aventisia.com")
        {
            NodeType = nodeType;
            Version = version;
            Author = author;
            SupportedPlatforms = supportedPlatforms;
            ErrorHandling = errorHandling;
            TestScreenType = testScreenType;
            NodeIcon = nodeIcon;
            NodeImg = nodeImg;
            DocsLink = docsLink;
        }
    }
}
