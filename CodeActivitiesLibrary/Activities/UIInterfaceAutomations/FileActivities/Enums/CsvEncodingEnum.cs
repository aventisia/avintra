using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.FileActivities.Enums
{
    public enum CsvEncodingEnum
    {
        [Description("System default")]
        SystemDefault,
        [Description("UTF-8")]
        UTF8,
        [Description("Unicode")]
        Unicode,
        [Description("Unicode (big-endian)")]
        BigEndianUnicode,
        [Description("UTF-8 (no byte order mark)")]
        UTF8NoBOM,
        [Description("ASCII")]
        ASCII
    }
}
