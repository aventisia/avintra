using System.Activities;

namespace CodeActivitiesLibrary.Extensions
{
    public abstract class BaseCodeActivity : CodeActivity
    {
        public InArgument<string> AccessToken { get; set; }
        public OutArgument<bool> IsSuccess { get; set; }
        public OutArgument<string> StatusMessage { get; set; }
    }
}