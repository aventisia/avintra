using CodeActivitiesLibrary.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.AppIntegrations.SalesforceActivities
{
    [ActivityCategoryMetadata(
        primaryCategory: "App Integrations",
        label: "Salesforce",
        description: "Work with Salesforce Actions.",
        img:"/assets/Salesforce.svg",
        doNotRenderIf: "enterprise")]
    internal class _SalesforceCategoryMetaData
    {
    }
}
