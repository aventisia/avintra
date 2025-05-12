

namespace MLModelBuilderAPIs.MappingProfiles;

public class ExtractionSetupMappingProfile : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        // Mapping of DTO to get list of extraction setup to show on the UI.
        config.NewConfig<ExtractionSetup, ExtractionSetupDto>()
            .Map(dest => dest.TableMetadata, src => src.TableMetadata != null ? src.TableMetadata.Select(s => new TableMetadataDto()
            {
                Id = s.Id,
                Name = s.Name,
                Context = s.Context,
                TableHeaders = s.TableHeaders != null ? s.TableHeaders.Select(s1 => new TableHeaderDto()
                {
                    Id = s1.Id,
                    Name = s1.Name,
                    Type = s1.Type,
                    Instructions = s1.Instructions
                }).ToList() : null
            }).ToList() : null)
            .Map(dest => dest.FieldSetups, src => src.FieldSetups != null ? src.FieldSetups.Select(s => new FieldSetupDto()
            {
                Id = s.Id,
                Name = s.Name,
                Type = s.Type,
                Instructions = s.Instructions
            }).ToList() : null)
            .Map(dest => dest.MlModelName, src => src.MLModel != null ? src.MLModel.Name : null)
            .Map(dest => dest.CreatedBy,
                src => src.CreatedByUser != null
                ? src.CreatedByUser.FirstName + " " + src.CreatedByUser.LastName
                : null)
            .Map(dest => dest.CreatedByUsername, src => src.CreatedByUser != null
                ? src.CreatedByUser.UserName
                : null);

        //Mapping entity to insert or update the record
        config.NewConfig<ExtractionSetupDto, ExtractionSetup>()
            .Ignore(dest => dest.Id)
            .Ignore(dest => dest.CreatedByUserId)
            .Ignore(dest => dest.LastModifiedByUserId)
            .Ignore(dest => dest.CreatedOn)
            .Ignore(dest => dest.LastModifiedOn)
            .IgnoreNullValues(true);

    }
}