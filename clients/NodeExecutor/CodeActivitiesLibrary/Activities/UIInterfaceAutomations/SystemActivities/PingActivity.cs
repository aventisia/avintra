using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Net.NetworkInformation;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.SystemActivities
{
    [DisplayName("Ping")]
    [Description("Sends a message to determine whether a remote computer is accessible over the network.")]
    [ActivityMetaData(nodeImg: "/assets/System.svg")]
    public class PingActivity : BaseCodeActivity
    {       
        [RequiredArgument]
        [DisplayName("Host name")]
        [Description("The host name or IP address to ping.")]
        public InArgument<string> HostName { get; set; }

        [DisplayName("Timeout")]
        [Description("The maximum time (in milliseconds) to wait for a response.")]
        [DefaultValue(5000)]
        public InArgument<int> Timeout { get; set; }
        
        [DisplayName("Ping Result")]
        [Description("The status of the ping message (success or failure).")]
        public OutArgument<bool> PingResult { get; set; }

        [DisplayName("Round Trip Time")]
        [Description("The number of milliseconds taken for the Ping to complete.")]
        public OutArgument<int> RoundTripTime { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input arguments
                var hostName = HostName.Get(context);
                var timeout = Timeout.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(hostName))
                    throw new ArgumentException("Host name cannot be empty.");

                if (timeout < 0)
                    throw new ArgumentException("Timeout must be a non-negative value.");

                // Perform the ping operation
                using (var ping = new Ping())
                {
                    var pingOptions = new PingOptions();
                    var reply = ping.Send(hostName, timeout, new byte[32], pingOptions);

                    // Set output arguments
                    PingResult.Set(context, reply.Status == IPStatus.Success);
                    RoundTripTime.Set(context, reply.RoundtripTime);
                }
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Ping completed successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error pinging host: {ex.Message}");
                PingResult.Set(context, false);
                RoundTripTime.Set(context, -1);
            }
        }
    }
}