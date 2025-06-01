using System.Activities;

namespace CodeActivitiesLibrary.Extensions
{
    public abstract class BaseCodeActivity : CodeActivity
    {
        public OutArgument<string> StatusMessage { get; set; }
    }
}