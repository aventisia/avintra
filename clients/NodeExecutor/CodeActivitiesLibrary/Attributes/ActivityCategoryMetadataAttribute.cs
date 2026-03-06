using System;

namespace CodeActivitiesLibrary.Extensions
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public class ActivityCategoryMetadataAttribute : Attribute
    {
        public string PrimaryCategory { get; }
        public string Label { get; }
        public string Description { get; }
        public string Icon { get; }
        public string Img { get; }
        public string ListType { get; }

        /// <summary>
        /// Possible values (one or more separated by comma): "windows", "cloud", "cloud,windows". 
        /// We can set this on activity category level and then if needed then we can also override it on activity level.
        /// </summary>
        public string SupportedPlatforms { get; }

        /// <summary>
        /// Possible values (one or more separated by comma): "production" or "commercial" or "enterprise" or "production,enterprise" etc
        /// </summary>
        public string DoNotRenderIf { get; }

        public ActivityCategoryMetadataAttribute(
            string primaryCategory,
            string label,
            string description,
            string icon = null,
            string img = null,
            string listType = null,
            string supportedPlatforms = "cloud,windows",
            string doNotRenderIf = null)
        {
            PrimaryCategory = primaryCategory;
            Label = label;
            Description = description;
            Icon = icon;
            Img = img;
            ListType = listType;
            SupportedPlatforms = supportedPlatforms;
            DoNotRenderIf = doNotRenderIf;
        }
    }
}
