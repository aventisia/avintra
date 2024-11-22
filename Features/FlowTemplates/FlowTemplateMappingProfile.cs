using WorkspaceAPIs.Entities;
using WorkspaceAPIs.DTOs;
using Mapster;

namespace WorkspaceAPIs.MappingProfiles
{
    public class FlowTemplateMappingProfile : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            // Request mapping for inserting or updating a flow template record
            config.NewConfig<FlowTemplateDto, FlowTemplate>();

            // Request mapping for getting flow template record
            config.NewConfig<FlowTemplate , FlowTemplateDto>();

            // Request mapping for getting flow template record by category and name
            config.NewConfig<FlowTemplate,FlowTemplateCategoryBySearchQueryDto>();
            
        }
    }
}
