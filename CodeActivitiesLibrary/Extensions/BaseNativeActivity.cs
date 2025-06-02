using System.Activities;

namespace CodeActivitiesLibrary.Extensions
{
    public abstract class BaseNativeActivity : NativeActivity
    {
        public OutArgument<string> StatusMessage { get; set; }
    }
}