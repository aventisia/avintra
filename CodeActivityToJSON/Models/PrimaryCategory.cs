using System.Collections.Generic;

namespace CodeActivityToJSON.Models
{
    internal class PrimaryCategory
    {
        public string Label { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
        public string Img { get; set; }
        public List<ActionCategory> ActionCategories { get; set; }
    }
}
