namespace AccountsAPIs.MappingProfiles;

public class AccountUsersTableMappingProfile : Profile
{
    public AccountUsersTableMappingProfile()
    {
        // Mapping to get user record or list of user records
        CreateMap<AccountUser, AccountUsersTableDto>()
            .ForMember(dest => dest.UserRoles, opt => opt.MapFrom(src => src.UserRoles.Select(s => s.Role.FullName).ToList()))
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName))
            .ForMember(dest => dest.LastModifiedBy, opt => opt.MapFrom(src => src.LastModifiedByUser.FirstName + " " + src.LastModifiedByUser.LastName));

        // Mapping for inserting or updating user record
        CreateMap<AccountUsersTableDto, AccountUser>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.IsDisabled, opt => opt.Ignore())
            .ForMember(dest => dest.EmailConfirmed, opt => opt.Ignore())
            .ForMember(dest => dest.PwdSetOn, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
            .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
            .ForAllMembers(x => x.Condition((src, dest, srcMember) => srcMember != null));

        // Get roles in SelectOptionDto format
        CreateMap<AccountRole, SelectOptionDto>()
            .ForMember(dest => dest.Label, opt => opt.MapFrom(src => src.FullName))
            .ForMember(dest => dest.Value, opt => opt.MapFrom(src => src.FullName))
            .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description));
    }
}