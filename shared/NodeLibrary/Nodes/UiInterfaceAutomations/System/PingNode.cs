using System.Net.NetworkInformation;

namespace NodeLibrary.SystemNodes;

[DisplayName("Ping"), Description("Sends a message to determine whether a remote computer is accessible over the network.")]
[NodeMetadata(icon: "/assets/System.svg")]
public class PingNode : BaseNode
{
    [DisplayName("Host name"), Description("The host name or IP address to ping.")]
    public required InArgument<string> HostName { get; set; }

    [DisplayName("Timeout"), Description("The maximum time (in milliseconds) to wait for a response.")]
    public InArgument<int> Timeout { get; set; } = new InArgument<int>(5000);

    [DisplayName("Ping Result"), Description("The status of the ping message (success or failure).")]
    public OutArgument<bool> PingResult { get; set; } = new OutArgument<bool>();

    [DisplayName("Round Trip Time"), Description("The number of milliseconds taken for the Ping to complete.")]
    public OutArgument<int> RoundTripTime { get; set; } = new OutArgument<int>();

    protected override void Execute(INodeContext context)
    {
        var status = "Ping completed successfully.";

        try
        {
            var hostName = HostName.Get(context);
            var timeout = Timeout.Get(context);

            if (string.IsNullOrWhiteSpace(hostName))
                throw new ArgumentException("Host name cannot be empty.");

            if (timeout < 0)
                throw new ArgumentException("Timeout must be a non-negative value.");

            using var ping = new Ping();
            var pingOptions = new PingOptions();
            var reply = ping.Send(hostName, timeout, new byte[32], pingOptions);

            PingResult.Set(context, reply.Status == IPStatus.Success);
            RoundTripTime.Set(context, (int)reply.RoundtripTime);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
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
