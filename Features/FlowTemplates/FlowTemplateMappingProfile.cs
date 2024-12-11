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

            //Request mapping for publishing flow as a template record
            config.NewConfig<Flow,FlowTemplate>()
            .Map(dest => dest.FlowId,src => src.Id)
            .IgnoreNullValues(true);

            // Request mapping for getting flow template record
            config.NewConfig<FlowTemplate , FlowTemplateDto>();

            // Request mapping for getting  trending flow template record
            config.NewConfig<FlowTemplate,TrendingFlowTemplateDto>();

            // Request mapping for getting flow template record by category and name
            config.NewConfig<FlowTemplate,FlowTemplateCategoryBySearchQueryDto>();
            
        }
    }
}
