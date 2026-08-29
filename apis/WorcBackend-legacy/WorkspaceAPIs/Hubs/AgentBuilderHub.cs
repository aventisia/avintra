namespace WorkspaceAPIs.Hubs;

/// <summary>
/// Handles real-time collaboration for the agent builder: presence, node/edge/flow-action
/// locking, and live node/edge edit broadcast. All clients must present a valid JWT.
/// </summary>
[Authorize]
public class AgentBuilderHub : Hub
{
    private readonly IAgentBuilderStore _chatStore;
    private readonly ICollaborationStore _collaborationStore;
    private readonly ILogger<AgentBuilderHub> _logger;

    public AgentBuilderHub(
        IAgentBuilderStore chatStore,
        ICollaborationStore collaborationStore,
        ILogger<AgentBuilderHub> logger)
    {
        _chatStore = chatStore;
        _collaborationStore = collaborationStore;
        _logger = logger;
    }

    private Guid UserId => Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    private Guid TenantId => Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

    /// <summary>
    /// Stable identity used to attribute locks/edits. Uses the user's email so it
    /// matches the identifier the studio frontend sends and compares against.
    /// Falls back to the uid string if no email claim is present.
    /// </summary>
    private string HolderId => Email ?? UserId.ToString();

    private string? DisplayName
    {
        get
        {
            var name = Context?.User?.FindFirstValue("name");
            if (!string.IsNullOrWhiteSpace(name)) return name;
            return Context?.User?.FindFirstValue(ClaimTypes.Name);
        }
    }

    private string? Email => Context?.User?.FindFirstValue("email")
        ?? Context?.User?.FindFirstValue("uname");

    // When user connects → store session.
    public override async Task OnConnectedAsync()
    {
        var user = new AgentBuilderModel
        {
            UserId = UserId,
            TenantId = TenantId,
            ConnectionId = Context.ConnectionId,
            LastSeen = DateTimeOffset.UtcNow
        };

        await _chatStore.AddOrUpdateAsync(user);
        await base.OnConnectedAsync();
    }

    // When user disconnects → remove session, presence, and release all their locks.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await _chatStore.RemoveByConnectionIdAsync(Context.ConnectionId);

        var presence = await _collaborationStore.RemovePresenceByConnectionIdAsync(Context.ConnectionId);
        if (presence != null)
        {
            await Clients.Group(presence.FlowVersionId.ToString())
                .SendAsync("PresenceChanged", await _collaborationStore.GetPresenceForFlowAsync(presence.FlowVersionId));
        }

        var released = await _collaborationStore.ReleaseAllLocksForUserAsync(HolderId);
        foreach (var lockDto in released)
        {
            await Clients.Group(lockDto.FlowVersionId.ToString()).SendAsync("LockReleased", lockDto);
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Joins a flow version's collaboration group and returns the current presence + locks snapshot.
    /// </summary>
    public async Task JoinFlow(Guid flowVersionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, flowVersionId.ToString());

        var presence = new PresenceDto
        {
            UserId = UserId,
            DisplayName = DisplayName,
            Email = Email,
            ConnectionId = Context.ConnectionId,
            FlowVersionId = flowVersionId,
            JoinedAt = DateTimeOffset.UtcNow,
        };
        await _collaborationStore.AddPresenceAsync(presence);

        var presenceList = await _collaborationStore.GetPresenceForFlowAsync(flowVersionId);
        var locks = await _collaborationStore.GetLocksForFlowAsync(flowVersionId);

        await Clients.Group(flowVersionId.ToString()).SendAsync("PresenceChanged", presenceList);
        await Clients.Caller.SendAsync("CollaborationSnapshot", new { presence = presenceList, locks });
    }

    /// <summary>
    /// Leaves the current flow version's collaboration group.
    /// </summary>
    public async Task LeaveFlow(Guid flowVersionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, flowVersionId.ToString());

        var presence = await _collaborationStore.RemovePresenceByConnectionIdAsync(Context.ConnectionId);
        if (presence != null)
        {
            await Clients.Group(flowVersionId.ToString())
                .SendAsync("PresenceChanged", await _collaborationStore.GetPresenceForFlowAsync(flowVersionId));
        }
    }

    /// <summary>
    /// Attempts to acquire a lock. On success broadcasts to the group; on failure returns null to the caller.
    /// </summary>
    public async Task<LockDto?> AcquireLock(LockDto lockDto)
    {
        lockDto.HolderUserId = HolderId;
        lockDto.HolderDisplayName = DisplayName;

        var acquired = await _collaborationStore.TryAcquireLockAsync(lockDto);
        if (acquired == null)
        {
            // Return the current holder so the caller can show who holds it.
            var existing = (await _collaborationStore.GetLocksForFlowAsync(lockDto.FlowVersionId))
                .FirstOrDefault(l => l.LockKey == lockDto.LockKey);
            return existing;
        }

        await Clients.Group(lockDto.FlowVersionId.ToString()).SendAsync("LockAcquired", acquired);
        return acquired;
    }

    /// <summary>
    /// Extends the TTL of a lock held by the current user (heartbeat while actively editing).
    /// </summary>
    public async Task<bool> RefreshLock(string lockKey)
    {
        return await _collaborationStore.RefreshLockAsync(lockKey, HolderId);
    }

    /// <summary>
    /// Releases a lock held by the current user and broadcasts the release.
    /// </summary>
    public async Task ReleaseLock(string lockKey, Guid flowVersionId)
    {
        var released = await _collaborationStore.ReleaseLockAsync(lockKey, HolderId);
        if (!released) return;

        await Clients.Group(flowVersionId.ToString()).SendAsync("LockReleased", new { LockKey = lockKey });
    }

    /// <summary>
    /// Force-releases a lock regardless of holder (owner/OM/TU only).
    /// </summary>
    public async Task ForceReleaseLock(string lockKey, Guid flowVersionId)
    {
        var released = await _collaborationStore.ForceReleaseLockAsync(lockKey);
        if (!released) return;

        await Clients.Group(flowVersionId.ToString()).SendAsync("LockReleased", new { LockKey = lockKey });
    }

    /// <summary>
    /// Broadcasts a node edit to other collaborators in the flow.
    /// </summary>
    public async Task BroadcastNodeChange(NodeEditDto edit)
    {
        edit.EditedByUserId = HolderId;
        edit.EditedByDisplayName = DisplayName;
        edit.Timestamp = DateTimeOffset.UtcNow;

        await Clients.OthersInGroup(edit.FlowVersionId.ToString()).SendAsync("NodeChanged", edit);
    }

    /// <summary>
    /// Broadcasts an edge edit to other collaborators in the flow.
    /// </summary>
    public async Task BroadcastEdgeChange(EdgeEditDto edit)
    {
        edit.EditedByUserId = HolderId;
        edit.EditedByDisplayName = DisplayName;
        edit.Timestamp = DateTimeOffset.UtcNow;

        await Clients.OthersInGroup(edit.FlowVersionId.ToString()).SendAsync("EdgeChanged", edit);
    }

    /// <summary>
    /// Broadcasts a full graph snapshot (nodes + edges) for structural changes such as
    /// adding or deleting a node. Structural edits re-run dagre layout which repositions
    /// the whole graph, so collaborators replace their entire graph to avoid overlap.
    /// </summary>
    public async Task BroadcastGraphChange(GraphEditDto edit)
    {
        edit.EditedByUserId = HolderId;
        edit.EditedByDisplayName = DisplayName;
        edit.Timestamp = DateTimeOffset.UtcNow;

        await Clients.OthersInGroup(edit.FlowVersionId.ToString()).SendAsync("GraphChanged", edit);
    }

    /// <summary>
    /// Broadcasts a flow-level action lock to other collaborators.
    /// </summary>
    public async Task BroadcastFlowAction(FlowActionLockDto action)
    {
        action.HolderUserId = HolderId;
        action.HolderDisplayName = DisplayName;

        await Clients.OthersInGroup(action.FlowVersionId.ToString()).SendAsync("FlowActionLocked", action);
    }

    /// <summary>
    /// Broadcasts that a flow-level action lock has been released, so collaborators can
    /// re-enable the action (e.g. the Publish button) once the holder is done.
    /// </summary>
    public async Task BroadcastFlowActionRelease(FlowActionLockDto action)
    {
        action.HolderUserId = HolderId;
        action.HolderDisplayName = DisplayName;

        await Clients.OthersInGroup(action.FlowVersionId.ToString()).SendAsync("FlowActionLockReleased", action);
    }

    /// <summary>
    /// Broadcasts a collaborator's live cursor position to other users in the flow.
    /// The sender's identity is stamped server-side (not trusted from the client) so
    /// recipients can attribute and filter cursors reliably. UserId is set to the same
    /// user Guid used by PresenceDto so a user's cursor color matches their presence
    /// avatar color in the studio header.
    /// </summary>
    public async Task BroadcastCursor(CursorDto cursor)
    {
        cursor.UserId = UserId.ToString();
        cursor.DisplayName = DisplayName;
        cursor.Email = Email;
        cursor.ConnectionId = Context.ConnectionId;

        await Clients.OthersInGroup(cursor.FlowVersionId.ToString()).SendAsync("CursorChanged", cursor);
    }

    /// <summary>
    /// Broadcasts an ephemeral chat message to collaborators in the flow. The sender's
    /// identity is stamped server-side (not trusted from the client). A null
    /// <see cref="ChatMessageDto.RecipientUserId"/> targets everyone in the flow group;
    /// a non-null value targets a single user. Messages are broadcast-only and never
    /// persisted — recipients filter by recipient id client-side.
    /// </summary>
    public async Task SendChatMessage(ChatMessageDto message)
    {
        message.SenderUserId = HolderId;
        message.SenderDisplayName = DisplayName;
        message.SenderEmail = Email;
        message.SentAt = DateTimeOffset.UtcNow;

        await Clients.OthersInGroup(message.FlowVersionId.ToString()).SendAsync("ChatMessageReceived", message);
    }
}
