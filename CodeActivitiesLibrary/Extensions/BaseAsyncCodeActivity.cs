using System.Activities;

namespace CodeActivitiesLibrary.Extensions
{
    public abstract class BaseAsyncCodeActivity : AsyncCodeActivity
    {
        public OutArgument<bool> IsSuccess { get; set; }
        public OutArgument<string> StatusMessage { get; set; }
    }
}