namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Payload for updating the triage information of a change request.
/// </summary>
public class TicketTriageUpdateDto
{
    /// <summary>The ticket to update.</summary>
    [RequiredGuid]
    public Guid TicketId { get; set; }

    /// <summary>Complexity value matching <see cref="ComplexityEnum"/>.</summary>
    public ComplexityEnum? Complexity { get; set; }

    /// <summary>Estimated effort in hours.</summary>
    public int? EstimatedEffortHours { get; set; }

    /// <summary>Estimated completion date.</summary>
    public DateTimeOffset? EstimatedCompletionDate { get; set; }

    /// <summary>True when the change is billable.</summary>
    public bool? IsBillable { get; set; }

    /// <summary>True when customer approval is required.</summary>
    public bool? RequiresCustomerApproval { get; set; }

    /// <summary>Risk level value matching <see cref="RiskLevelEnum"/>.</summary>
    public RiskLevelEnum? RiskLevel { get; set; }

    /// <summary>Dependencies. Max length: 500.</summary>
    [StringLength(500)]
    public string? Dependencies { get; set; }

    /// <summary>Triage remarks. Max length: 1000.</summary>
    [StringLength(1000)]
    public string? TriageRemarks { get; set; }
}
