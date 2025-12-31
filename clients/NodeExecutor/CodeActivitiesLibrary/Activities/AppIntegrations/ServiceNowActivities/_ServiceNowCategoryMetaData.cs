using CodeActivitiesLibrary.Extensions;

namespace CodeActivitiesLibrary.AppIntegrations.ServiceNowActivities
{
    [ActivityCategoryMetadata(
       primaryCategory: "App Integrations",
       label: "ServiceNow",
       description: "Perform ServiceNow operations including incident management, " +
        "user and configuration management, attachment handling, and record manipulation. Authenticate via Basic Auth or OAuth2 and securely reuse credentials across actions.",
        img: "/assets/ServiceNow.svg")]

    internal class _ServiceNowCategoryMetaData
    {
    }
}
