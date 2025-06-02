using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.MessageBoxActivities
{

    public enum DialogResultEnum
    {
        [Description("First button")] FirstButton,
        [Description("Second button")] SecondButton,
        [Description("Third button")] ThirdButton,
        [Description("OK")] OK,
        [Description("Cancel")] Cancel,
        [Description("Abort")] Abort,
        [Description("Retry")] Retry,
        [Description("Ignore")] Ignore,
    }
}
