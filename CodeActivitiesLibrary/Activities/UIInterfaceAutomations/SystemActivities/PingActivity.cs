using System;
using System.Activities;
using System.ComponentModel;
using System.Net.NetworkInformation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.SystemActivities
{
    [DisplayName("Ping"),
     Description("Sends a message to determine whether a remote computer is accessible over the network.")]
    public class PingActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The IP address or hostname to ping.")]
        public InArgument<string> Host { get; set; }

        [Category("Output"), Description("Returns true if the host is reachable, otherwise false.")]
        public OutArgument<bool> IsReachable { get; set; }

        
        

        protected override void Execute(CodeActivityContext context)
        {
            var host = Host.Get(context);
            var isReachable = false;
            var status = "";

            try
            {
                using (var pingSender = new Ping())
                {
                    var reply = pingSender.Send(host);
                    isReachable = reply.Status == IPStatus.Success;
                }
                StatusMessage.Set(context, "Ping completed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error pinging host: {ex.Message}";
            }

            IsReachable.Set(context, isReachable);
            StatusMessage.Set(context, status);
        }
    }
}