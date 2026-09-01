using System.Text;

namespace WorkspaceAPIs.Features.CloudConnectors.CamelV2.Helpers;

/// <summary>
/// Shared naming conventions for Camel Cloud Connector action nodes.
///
/// The action name is the key that ties together three artifacts that MUST stay
/// in lockstep:
///   - the action-selector <c>name</c> (e.g. <c>Camel/Github/PullRequestReviewAddReviewerConnector</c>)
///   - the config file name (e.g. <c>ConfigFiles/Camel/Github/PullRequestReviewAddReviewerConnector.json</c>)
///   - the <c>CamelActionMapping.json</c> key (e.g. <c>"PullRequestReviewAddReviewer"</c>)
///
/// The convention splits compound words and applies a proper-noun dictionary so
/// that <c>pullrequest.review.add-reviewer</c> becomes <c>PullRequestReviewAddReviewer</c>
/// (not the naive <c>PullrequestReviewAddReviewer</c>).
/// </summary>
public static class CamelNodeNaming
{
    /// <summary>
    /// Proper-noun / compound-word replacements applied to the dotted harness
    /// operation before PascalCasing. Keys are matched case-insensitively against
    /// the raw dotted segments (e.g. "pullrequest", "calendarevent", "oauth2").
    /// </summary>
    private static readonly Dictionary<string, string> ProperNouns = new(StringComparer.OrdinalIgnoreCase)
    {
        ["pullrequest"] = "PullRequest",
        ["calendarevent"] = "CalendarEvent",
        ["calendarattendee"] = "CalendarAttendee",
        ["mailattachment"] = "MailAttachment",
        ["mailfolder"] = "MailFolder",
        ["teamsmessage"] = "TeamsMessage",
        ["teamschannel"] = "TeamsChannel",
        ["teamschat"] = "TeamsChat",
        ["teamschatmember"] = "TeamsChatMember",
        ["teamsmeeting"] = "TeamsMeeting",
        ["teamscall"] = "TeamsCall",
        ["teamsmember"] = "TeamsMember",
        ["drivefile"] = "DriveFile",
        ["drivepermission"] = "DrivePermission",
        ["sharepointsite"] = "SharePointSite",
        ["sharepointlist"] = "SharePointList",
        ["sharepointlistitem"] = "SharePointListItem",
        ["sharepointdrive"] = "SharePointDrive",
        ["onedrive"] = "OneDrive",
        ["oauth2"] = "OAuth2",
        ["auditreport"] = "AuditReport",
        ["serviceprincipal"] = "ServicePrincipal",
        ["github"] = "GitHub",
        ["sharepoint"] = "SharePoint",
        ["outlook"] = "Outlook",
        ["graph"] = "Graph",
        ["azure"] = "Azure",
        ["aws"] = "Aws",
        ["gcp"] = "Gcp",
        ["smtp"] = "Smtp",
        ["imap"] = "Imap",
        ["pop3"] = "Pop3",
        ["sftp"] = "Sftp",
        ["ftps"] = "Ftps",
        ["jdbc"] = "Jdbc",
        ["jms"] = "Jms",
        ["kafka"] = "Kafka",
        ["mongodb"] = "MongoDb",
        ["elasticsearch"] = "Elasticsearch",
        ["salesforce"] = "Salesforce",
        ["zendesk"] = "Zendesk",
        ["twilio"] = "Twilio",
        ["slack"] = "Slack",
        ["telegram"] = "Telegram",
        ["stripe"] = "Stripe",
        ["paypal"] = "PayPal",
        ["dropbox"] = "Dropbox",
        ["splunk"] = "Splunk",
        ["redis"] = "Redis",
        ["bigquery"] = "BigQuery",
        ["pubsub"] = "PubSub",
        ["cosmosdb"] = "CosmosDb",
        ["eventhubs"] = "EventHubs",
        ["servicebus"] = "ServiceBus",
        ["secretsmanager"] = "SecretsManager",
        ["eventbridge"] = "EventBridge",
        ["stepfunctions"] = "StepFunctions",
        ["cloudwatch"] = "CloudWatch",
        ["kinesis"] = "Kinesis",
        ["sagemaker"] = "SageMaker",
        ["comprehend"] = "Comprehend",
        ["rekognition"] = "Rekognition",
        ["textract"] = "Textract",
        ["translate"] = "Translate",
        ["bedrock"] = "Bedrock",
        ["glue"] = "Glue",
        ["athena"] = "Athena",
        ["redshift"] = "Redshift",
        ["dynamodb"] = "DynamoDb",
        ["secrets-manager"] = "SecretsManager",
        ["step-functions"] = "StepFunctions",
        ["event-bridge"] = "EventBridge",
        ["cloud-watch"] = "CloudWatch",
        ["s3"] = "S3",
        ["sqs"] = "Sqs",
        ["sns"] = "Sns",
        ["ddb"] = "Ddb",
        ["ec2"] = "Ec2",
        ["ecs"] = "Ecs",
        ["eks"] = "Eks",
        ["iam"] = "Iam",
        ["msk"] = "Msk",
        ["ses"] = "Ses",
        ["lambda"] = "Lambda",
        ["storage-blob"] = "StorageBlob",
        ["storage"] = "Storage",
    };

    /// <summary>
    /// Maps a PascalCase proper-noun token to its human-readable display form
    /// (e.g. <c>PullRequest</c> → <c>Pull Request</c>, <c>OAuth2</c> → <c>OAuth2</c>).
    /// Used by <see cref="ToActionDisplay"/>.
    /// </summary>
    private static readonly Dictionary<string, string> ProperNounDisplay = new(StringComparer.Ordinal)
    {
        ["PullRequest"] = "Pull Request",
        ["CalendarEvent"] = "Calendar Event",
        ["CalendarAttendee"] = "Calendar Attendee",
        ["MailAttachment"] = "Mail Attachment",
        ["MailFolder"] = "Mail Folder",
        ["TeamsMessage"] = "Teams Message",
        ["TeamsChannel"] = "Teams Channel",
        ["TeamsChat"] = "Teams Chat",
        ["TeamsChatMember"] = "Teams Chat Member",
        ["TeamsMeeting"] = "Teams Meeting",
        ["TeamsCall"] = "Teams Call",
        ["TeamsMember"] = "Teams Member",
        ["DriveFile"] = "Drive File",
        ["DrivePermission"] = "Drive Permission",
        ["SharePointSite"] = "SharePoint Site",
        ["SharePointList"] = "SharePoint List",
        ["SharePointListItem"] = "SharePoint List Item",
        ["SharePointDrive"] = "SharePoint Drive",
        ["OneDrive"] = "OneDrive",
        ["OAuth2"] = "OAuth2",
        ["AuditReport"] = "Audit Report",
        ["ServicePrincipal"] = "Service Principal",
        ["GitHub"] = "GitHub",
        ["SharePoint"] = "SharePoint",
        ["Outlook"] = "Outlook",
        ["Graph"] = "Graph",
        ["Azure"] = "Azure",
        ["Aws"] = "AWS",
        ["Gcp"] = "GCP",
        ["Smtp"] = "SMTP",
        ["Imap"] = "IMAP",
        ["Pop3"] = "POP3",
        ["Sftp"] = "SFTP",
        ["Ftps"] = "FTPS",
        ["Jdbc"] = "JDBC",
        ["Jms"] = "JMS",
        ["Kafka"] = "Kafka",
        ["MongoDb"] = "MongoDB",
        ["Elasticsearch"] = "Elasticsearch",
        ["Salesforce"] = "Salesforce",
        ["Zendesk"] = "Zendesk",
        ["Twilio"] = "Twilio",
        ["Slack"] = "Slack",
        ["Telegram"] = "Telegram",
        ["Stripe"] = "Stripe",
        ["PayPal"] = "PayPal",
        ["Dropbox"] = "Dropbox",
        ["Splunk"] = "Splunk",
        ["Redis"] = "Redis",
        ["BigQuery"] = "BigQuery",
        ["PubSub"] = "Pub/Sub",
        ["CosmosDb"] = "Cosmos DB",
        ["EventHubs"] = "Event Hubs",
        ["ServiceBus"] = "Service Bus",
        ["SecretsManager"] = "Secrets Manager",
        ["EventBridge"] = "EventBridge",
        ["StepFunctions"] = "Step Functions",
        ["CloudWatch"] = "CloudWatch",
        ["Kinesis"] = "Kinesis",
        ["SageMaker"] = "SageMaker",
        ["Comprehend"] = "Comprehend",
        ["Rekognition"] = "Rekognition",
        ["Textract"] = "Textract",
        ["Translate"] = "Translate",
        ["Bedrock"] = "Bedrock",
        ["Glue"] = "Glue",
        ["Athena"] = "Athena",
        ["Redshift"] = "Redshift",
        ["DynamoDb"] = "DynamoDB",
        ["S3"] = "S3",
        ["Sqs"] = "SQS",
        ["Sns"] = "SNS",
        ["Ddb"] = "DDB",
        ["Ec2"] = "EC2",
        ["Ecs"] = "ECS",
        ["Eks"] = "EKS",
        ["Iam"] = "IAM",
        ["Msk"] = "MSK",
        ["Ses"] = "SES",
        ["Lambda"] = "Lambda",
        ["StorageBlob"] = "Storage Blob",
        ["Storage"] = "Storage",
    };

    /// <summary>
    /// Converts a dotted harness operation (e.g. <c>pullrequest.review.add-reviewer</c>)
    /// into the PascalCase action name used for the config file, the selector
    /// <c>name</c>, and the <c>CamelActionMapping.json</c> key
    /// (e.g. <c>PullRequestReviewAddReviewer</c>).
    /// </summary>
    public static string ToActionName(string operation)
    {
        if (string.IsNullOrWhiteSpace(operation))
        {
            return string.Empty;
        }

        var segments = operation.Split('.', StringSplitOptions.RemoveEmptyEntries);
        var sb = new StringBuilder();
        foreach (var segment in segments)
        {
            // Split hyphenated segments (e.g. "add-reviewer" → "add", "reviewer").
            foreach (var part in segment.Split('-', StringSplitOptions.RemoveEmptyEntries))
            {
                sb.Append(ToPascalSegment(part));
            }
        }
        return sb.ToString();
    }

    /// <summary>
    /// Converts a single dotted/hyphenated operation segment into a PascalCase
    /// word, applying the proper-noun dictionary first.
    /// </summary>
    private static string ToPascalSegment(string segment)
    {
        if (string.IsNullOrWhiteSpace(segment))
        {
            return string.Empty;
        }

        if (ProperNouns.TryGetValue(segment, out var proper))
        {
            return proper;
        }

        // Default: uppercase the first letter, keep the rest as-is.
        return char.ToUpperInvariant(segment[0]) + segment[1..];
    }

    /// <summary>
    /// Returns the human-readable family display name (e.g. <c>github</c> → <c>GitHub</c>,
    /// <c>m365</c> → <c>Microsoft 365</c>, <c>ftp</c> → <c>FTP</c>, <c>jms</c> → <c>JMS</c>).
    /// </summary>
    public static string ToFamilyDisplay(string family)
    {
        if (string.IsNullOrWhiteSpace(family))
        {
            return string.Empty;
        }

        return family.ToLowerInvariant() switch
        {
            "github" => "GitHub",
            "m365" => "Microsoft 365",
            "ftp" => "FTP",
            "ftps" => "FTPS",
            "sftp" => "SFTP",
            "jms" => "JMS",
            "jdbc" => "JDBC",
            "http" => "HTTP",
            "https" => "HTTPS",
            "smtp" => "SMTP",
            "imap" => "IMAP",
            "pop3" => "POP3",
            "sql" => "SQL",
            "kafka" => "Kafka",
            "mongodb" => "MongoDB",
            "elasticsearch" => "Elasticsearch",
            "salesforce" => "Salesforce",
            "zendesk" => "Zendesk",
            "twilio" => "Twilio",
            "slack" => "Slack",
            "telegram" => "Telegram",
            "stripe" => "Stripe",
            "paypal" => "PayPal",
            "dropbox" => "Dropbox",
            "splunk" => "Splunk",
            "redis" => "Redis",
            "bigquery" => "BigQuery",
            "pubsub" => "PubSub",
            "cosmosdb" => "CosmosDB",
            "eventhubs" => "Event Hubs",
            "servicebus" => "Service Bus",
            "secretsmanager" => "Secrets Manager",
            "eventbridge" => "EventBridge",
            "stepfunctions" => "Step Functions",
            "cloudwatch" => "CloudWatch",
            "kinesis" => "Kinesis",
            "sagemaker" => "SageMaker",
            "comprehend" => "Comprehend",
            "rekognition" => "Rekognition",
            "textract" => "Textract",
            "translate" => "Translate",
            "bedrock" => "Bedrock",
            "glue" => "Glue",
            "athena" => "Athena",
            "redshift" => "Redshift",
            "dynamodb" => "DynamoDB",
            "s3" => "S3",
            "sqs" => "SQS",
            "sns" => "SNS",
            "ddb" => "DDB",
            "ec2" => "EC2",
            "ecs" => "ECS",
            "eks" => "EKS",
            "iam" => "IAM",
            "msk" => "MSK",
            "ses" => "SES",
            "lambda" => "Lambda",
            "storage-blob" => "Storage Blob",
            "storage" => "Storage",
            "file" => "File",
            "aws2-s3" => "AWS S3",
            "aws2-sqs" => "AWS SQS",
            "aws2-lambda" => "AWS Lambda",
            "aws2-sns" => "AWS SNS",
            "aws2-ddb" => "AWS DynamoDB",
            "aws2-kinesis" => "AWS Kinesis",
            "aws2-secrets-manager" => "AWS Secrets Manager",
            "aws2-eventbridge" => "AWS EventBridge",
            "aws2-step-functions" => "AWS Step Functions",
            "aws2-athena" => "AWS Athena",
            "aws2-redshift" => "AWS Redshift",
            "aws2-ec2" => "AWS EC2",
            "aws2-ecs" => "AWS ECS",
            "aws2-eks" => "AWS EKS",
            "aws2-iam" => "AWS IAM",
            "aws2-cloudwatch" => "AWS CloudWatch",
            "aws2-logs" => "AWS Logs",
            "aws2-msk" => "AWS MSK",
            "aws2-ses" => "AWS SES",
            "aws2-translate" => "AWS Translate",
            "aws2-rekognition" => "AWS Rekognition",
            "aws2-comprehend" => "AWS Comprehend",
            "aws2-textract" => "AWS Textract",
            "aws2-bedrock" => "AWS Bedrock",
            "aws2-sagemaker" => "AWS SageMaker",
            "aws2-glue" => "AWS Glue",
            "azure-storage-blob" => "Azure Storage Blob",
            "azure-servicebus" => "Azure Service Bus",
            "azure-eventhubs" => "Azure Event Hubs",
            "azure-cosmosdb" => "Azure Cosmos DB",
            "google-storage" => "Google Cloud Storage",
            "google-drive" => "Google Drive",
            "google-calendar" => "Google Calendar",
            "google-mail" => "Google Mail",
            "google-sheets" => "Google Sheets",
            "google-bigquery" => "Google BigQuery",
            "google-pubsub" => "Google Pub/Sub",
            _ => ToPascalSegment(family)
        };
    }

    /// <summary>
    /// Returns the human-readable display name for a connector action node
    /// (e.g. <c>"GitHub — Pull Request Review Add Reviewer"</c>).
    /// </summary>
    public static string ToDisplayName(string family, string action)
    {
        var familyDisplay = ToFamilyDisplay(family);
        var actionDisplay = ToActionDisplay(action);
        return string.IsNullOrWhiteSpace(actionDisplay)
            ? familyDisplay
            : $"{familyDisplay} — {actionDisplay}";
    }

    /// <summary>
    /// Converts a PascalCase action name into space-separated words for display
    /// (e.g. <c>PullRequestReviewAddReviewer</c> → <c>Pull Request Review Add Reviewer</c>).
    /// Known proper nouns and acronyms (e.g. <c>OAuth2</c>, <c>S3</c>, <c>SQS</c>,
    /// <c>OneDrive</c>, <c>SharePoint</c>) are kept intact.
    /// </summary>
    public static string ToActionDisplay(string action)
    {
        if (string.IsNullOrWhiteSpace(action))
        {
            return string.Empty;
        }

        var words = SplitPascalWords(action);
        return string.Join(" ", words);
    }

    /// <summary>
    /// Splits a PascalCase name into words, keeping known proper nouns and
    /// acronyms together (e.g. <c>UserGetOAuth2PermissionGrants</c> →
    /// <c>User Get OAuth2 Permission Grants</c>).
    /// </summary>
    private static List<string> SplitPascalWords(string name)
    {
        var words = new List<string>();
        var i = 0;
        while (i < name.Length)
        {
            // 1. Try to match the longest known proper noun at this position.
            var proper = MatchProperNoun(name, i);
            if (proper != null)
            {
                words.Add(ProperNounDisplay.TryGetValue(proper, out var display) ? display : proper);
                i += proper.Length;
                continue;
            }

            // 2. Otherwise consume one PascalCase word.
            var start = i;
            i++;
            while (i < name.Length)
            {
                var c = name[i];
                if (!char.IsUpper(c))
                {
                    i++;
                    continue;
                }
                var prev = name[i - 1];
                var next = i + 1 < name.Length ? name[i + 1] : '\0';
                var prevIsUpper = char.IsUpper(prev);
                var nextIsLower = char.IsLower(next);
                // Break before an uppercase that follows a lowercase, or before an
                // uppercase that is followed by a lowercase (start of a new word).
                if (char.IsLower(prev) || (prevIsUpper && nextIsLower))
                {
                    break;
                }
                i++;
            }
            words.Add(name[start..i]);
        }
        return words;
    }

    /// <summary>
    /// Returns the longest known proper-noun value that starts at <paramref name="start"/>
    /// in <paramref name="name"/>, or null when none matches.
    /// </summary>
    private static string? MatchProperNoun(string name, int start)
    {
        string? best = null;
        foreach (var value in ProperNouns.Values)
        {
            if (value.Length <= best?.Length)
            {
                continue;
            }
            if (start + value.Length <= name.Length
                && string.CompareOrdinal(name, start, value, 0, value.Length) == 0)
            {
                best = value;
            }
        }
        return best;
    }

    /// <summary>
    /// Returns the standard description for a connector action node
    /// (e.g. <c>"Pull request review add reviewer through the GitHub connector."</c>).
    /// </summary>
    public static string ToDescription(string family, string action)
    {
        var actionDisplay = ToActionDisplay(action);
        var familyDisplay = ToFamilyDisplay(family);
        if (string.IsNullOrWhiteSpace(actionDisplay))
        {
            return $"{familyDisplay} connector.";
        }
        return $"{actionDisplay} through the {familyDisplay} connector.";
    }

    /// <summary>
    /// Brand asset path for a CamelV2 family (e.g. <c>github</c> → <c>/brand-img/github.svg</c>,
    /// <c>aws2-s3</c> → <c>/assets/AWS.svg</c>). Mirrors the <c>FAMILY_ICON</c> map in
    /// <c>scripts/generate-camel-connectors/generate_camelv2_selector.py</c> so the
    /// runtime-generated action-selector mapping matches the script output. Falls back
    /// to the Camel brand icon when no specific asset is known.
    /// </summary>
    public static string ToFamilyIcon(string family)
    {
        if (string.IsNullOrWhiteSpace(family))
        {
            return DefaultFamilyIcon;
        }

        var key = family.ToLowerInvariant();
        if (FamilyIcons.TryGetValue(key, out var icon))
        {
            return icon;
        }

        // Prefix match (e.g. "aws2-s3" -> "aws" -> /assets/AWS.svg).
        var idx = key.LastIndexOf('-');
        while (idx > 0)
        {
            key = key[..idx];
            if (FamilyIcons.TryGetValue(key, out icon))
            {
                return icon;
            }
            idx = key.LastIndexOf('-');
        }

        // Wildcard match (e.g. "hazelcast-*", "ignite-*", "debezium-*").
        foreach (var (pattern, wildcardIcon) in FamilyIcons)
        {
            if (pattern.EndsWith("*", StringComparison.Ordinal)
                && family.StartsWith(pattern[..^1], StringComparison.OrdinalIgnoreCase))
            {
                return wildcardIcon;
            }
        }

        return DefaultFamilyIcon;
    }

    /// <summary>Default Camel brand icon used when a family has no specific asset.</summary>
    public const string DefaultFamilyIcon = "/function.png";

    /// <summary>
    /// Family-prefix → asset path map (mirrors <c>FAMILY_ICON</c> in the generator script).
    /// Keys are lowercase family names; <c>*</c>-suffixed keys are wildcard prefixes.
    /// </summary>
    private static readonly Dictionary<string, string> FamilyIcons = new(StringComparer.OrdinalIgnoreCase)
    {
        ["aws"] = "/assets/AWS.svg",
        ["azure"] = "/assets/Azure.svg",
        ["google"] = "/assets/GoogleWorkspace.svg",
        ["m365"] = "/assets/M365.svg",
        ["salesforce"] = "/assets/Salesforce.svg",
        ["twilio"] = "/assets/Twilio.svg",
        ["servicenow"] = "/assets/ServiceNow.svg",
        ["sendgrid"] = "/assets/SendGrid.svg",
        ["sap"] = "/assets/SAP.svg",
        ["file"] = "/assets/File.svg",
        ["sftp"] = "/assets/FTP.svg",
        ["ftp"] = "/assets/FTP.svg",
        ["ftps"] = "/assets/FTP.svg",
        ["scp"] = "/assets/FTP.svg",
        ["smb"] = "/assets/File.svg",
        ["http"] = "/assets/HTTP.svg",
        ["https"] = "/assets/HTTP.svg",
        ["netty-http"] = "/assets/HTTP.svg",
        ["platform-http"] = "/assets/HTTP.svg",
        ["servlet"] = "/assets/HTTP.svg",
        ["rest"] = "/assets/HTTP.svg",
        ["rest-api"] = "/assets/HTTP.svg",
        ["rest-openapi"] = "/assets/HTTP.svg",
        ["mail"] = "/assets/Email.svg",
        ["smtp"] = "/assets/Email.svg",
        ["smtps"] = "/assets/Email.svg",
        ["imap"] = "/assets/Email.svg",
        ["imaps"] = "/assets/Email.svg",
        ["pop3"] = "/assets/Email.svg",
        ["pop3s"] = "/assets/Email.svg",
        ["outlook"] = "/assets/Outlook.svg",
        ["sql"] = "/assets/Database.svg",
        ["sql-stored"] = "/assets/Database.svg",
        ["jdbc"] = "/assets/Database.svg",
        ["jpa"] = "/assets/Database.svg",
        ["jooq"] = "/assets/Database.svg",
        ["mybatis"] = "/assets/Database.svg",
        ["mybatis-bean"] = "/assets/Database.svg",
        ["mongodb"] = "/assets/Database.svg",
        ["mongodb-gridfs"] = "/assets/Database.svg",
        ["elasticsearch"] = "/assets/Database.svg",
        ["opensearch"] = "/assets/Database.svg",
        ["solr"] = "/assets/Database.svg",
        ["neo4j"] = "/assets/Database.svg",
        ["couchbase"] = "/assets/Database.svg",
        ["couchdb"] = "/assets/Database.svg",
        ["cassandra"] = "/assets/Database.svg",
        ["cassandraql"] = "/assets/Database.svg",
        ["influxdb"] = "/assets/Database.svg",
        ["influxdb2"] = "/assets/Database.svg",
        ["redis"] = "/assets/Database.svg",
        ["spring-redis"] = "/assets/Database.svg",
        ["kafka"] = "/assets/Database.svg",
        ["pulsar"] = "/assets/Database.svg",
        ["nats"] = "/assets/Database.svg",
        ["amqp"] = "/assets/Database.svg",
        ["amqps"] = "/assets/Database.svg",
        ["activemq"] = "/assets/Database.svg",
        ["activemq6"] = "/assets/Database.svg",
        ["rocketmq"] = "/assets/Database.svg",
        ["jms"] = "/assets/Database.svg",
        ["sjms"] = "/assets/Database.svg",
        ["sjms2"] = "/assets/Database.svg",
        ["spring-rabbitmq"] = "/assets/Database.svg",
        ["stomp"] = "/assets/Database.svg",
        ["paho"] = "/assets/Database.svg",
        ["paho-mqtt5"] = "/assets/Database.svg",
        ["kudu"] = "/assets/Database.svg",
        ["drill"] = "/assets/Database.svg",
        ["hbase"] = "/assets/Database.svg",
        ["ignite-*"] = "/assets/Database.svg",
        ["hazelcast-*"] = "/assets/Database.svg",
        ["infinispan"] = "/assets/Database.svg",
        ["infinispan-embedded"] = "/assets/Database.svg",
        ["ehcache"] = "/assets/Database.svg",
        ["jcache"] = "/assets/Database.svg",
        ["caffeine-cache"] = "/assets/Database.svg",
        ["caffeine-loadcache"] = "/assets/Database.svg",
        ["jcr"] = "/assets/Database.svg",
        ["jt400"] = "/assets/Database.svg",
        ["debezium-*"] = "/assets/Database.svg",
        ["cql"] = "/assets/Database.svg",
        ["clickhouse"] = "/assets/Database.svg",
        ["duckdb"] = "/assets/Database.svg",
        ["pgvector"] = "/assets/Database.svg",
    };
}
