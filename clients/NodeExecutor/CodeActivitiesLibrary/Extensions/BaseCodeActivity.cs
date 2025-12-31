using System.Activities;

namespace CodeActivitiesLibrary.Extensions
{
    public abstract class BaseCodeActivity : CodeActivity
    {
        public InArgument<string> AgentId { get; set; }
        public InArgument<string> AgentName { get; set; }
        public InArgument<string> AccessToken { get; set; }
        public OutArgument<bool> IsSuccess { get; set; }
        public OutArgument<string> StatusMessage { get; set; }
    }
}