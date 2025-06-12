using System.Activities;

namespace CodeActivitiesLibrary.Extensions
{
    public abstract class BaseAsyncCodeActivity : AsyncCodeActivity
    {
        public InArgument<string> StatusMessage { get; set; }
        public InArgument<string> IsSuccess { get; set; }
    }
}