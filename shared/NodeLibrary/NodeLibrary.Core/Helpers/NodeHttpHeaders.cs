using System.Net.Http;
using System.Net.Http.Headers;
using NodeLibrary.Core;

namespace NodeLibrary.Helpers;

/// <summary>
/// Shared helpers for attaching the execution environment header ("X-Env-Type") to outbound
/// node backend calls. The env is derived from the flow's publication status and carried on
/// <see cref="CallerContext.EnvType"/>; forwarding it lets backend services resolve Configure
/// resources (credentials, queues, tools, knowledge bases, skills) in the same environment.
/// </summary>
public static class NodeHttpHeaders
{
    /// <summary>
    /// The header name used to convey the deployment environment to backend services.
    /// </summary>
    public const string EnvHeaderName = "X-Env-Type";

    /// <summary>
    /// Adds the <c>X-Env-Type</c> header to the request from the caller context's environment.
    /// Defaults to <c>dev</c> when the caller context (or its env) is not supplied.
    /// </summary>
    public static void ApplyEnvHeader(HttpRequestMessage request, CallerContext? callerContext)
        => ApplyEnvHeader(request.Headers, callerContext);

    /// <summary>
    /// Adds the <c>X-Env-Type</c> header to the request from an explicit environment value.
    /// Defaults to <c>dev</c> when the value is blank.
    /// </summary>
    public static void ApplyEnvHeader(HttpRequestMessage request, string? envType)
        => ApplyEnvHeader(request.Headers, envType);

    /// <summary>
    /// Adds the <c>X-Env-Type</c> header to a client's default request headers from the caller
    /// context's environment. Defaults to <c>dev</c> when the caller context (or its env) is absent.
    /// </summary>
    public static void ApplyEnvHeader(HttpRequestHeaders headers, CallerContext? callerContext)
        => ApplyEnvHeader(headers, callerContext?.EnvType);

    /// <summary>
    /// Adds the <c>X-Env-Type</c> header to the given headers from an explicit environment value.
    /// Defaults to <c>dev</c> when the value is blank.
    /// </summary>
    public static void ApplyEnvHeader(HttpRequestHeaders headers, string? envType)
    {
        var value = string.IsNullOrWhiteSpace(envType) ? "dev" : envType.Trim().ToLowerInvariant();
        headers.Remove(EnvHeaderName);
        headers.Add(EnvHeaderName, value);
    }
}
