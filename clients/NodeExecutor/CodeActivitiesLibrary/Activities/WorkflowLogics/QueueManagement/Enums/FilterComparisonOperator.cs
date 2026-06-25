using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CodeActivitiesLibrary.Activities.WorkflowLogics.QueueManagement.Enums
{
    public enum FilterComparisonOperator
    {
        // String operators
        EqualTo,
        NotEqualTo,
        Contains,
        DoesNotContain,
        StartsWith,
        EndsWith,

        // Numeric operators
        GreaterThan,
        LessThan,
        GreaterThanOrEqual,
        LessThanOrEqual,

        // Date operators
        DateAfter,
        DateBefore,
        DateOnOrAfter,
        DateOnOrBefore,

        // Null operators
        IsNull,
        IsNotNull
    }
}
