using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenameWorkspaceTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // IMPORTANT NOTE: Databases that applied RemoveLegacyUnusedTables before its KeyStores rename was
            // added still have "KeyStores"; bring them to "ConfigStores" first.
            migrationBuilder.Sql(
                """
                DO $$
                BEGIN
                    IF to_regclass('"KeyStores"') IS NOT NULL AND to_regclass('"ConfigStores"') IS NULL THEN
                        ALTER TABLE "KeyStores" RENAME TO "ConfigStores";
                        ALTER TABLE "ConfigStores" RENAME CONSTRAINT "PK_KeyStores" TO "PK_ConfigStores";
                        ALTER TABLE "ConfigStores" RENAME CONSTRAINT "FK_KeyStores_WorkspaceUsers_CreatedByUserId" TO "FK_ConfigStores_WorkspaceUsers_CreatedByUserId";
                        ALTER TABLE "ConfigStores" RENAME CONSTRAINT "FK_KeyStores_WorkspaceUsers_LastModifiedByUserId" TO "FK_ConfigStores_WorkspaceUsers_LastModifiedByUserId";
                        ALTER INDEX "IX_KeyStores_CreatedByUserId" RENAME TO "IX_ConfigStores_CreatedByUserId";
                        ALTER INDEX "IX_KeyStores_LastModifiedByUserId" RENAME TO "IX_ConfigStores_LastModifiedByUserId";
                        ALTER INDEX "IX_KeyStores_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_ConfigStores_TenantId_SpaceId_EnvType_Name";
                    END IF;
                END $$;
                """);

            // IMPORTANT NOTE: Keys and indexes are renamed in place instead of dropped and re-created so large
            // tables are not re-indexed or re-validated. Names match the EF conventions, truncated at 63 characters.
            migrationBuilder.Sql(
                """
                ALTER TABLE "Flows" RENAME TO "agent_Flows";
                ALTER TABLE "agent_Flows" RENAME CONSTRAINT "FK_Flows_Folders_FolderId" TO "FK_agent_Flows_agent_Folders_FolderId";
                ALTER TABLE "agent_Flows" RENAME CONSTRAINT "FK_Flows_WorkspaceUsers_CreatedByUserId" TO "FK_agent_Flows_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_Flows" RENAME CONSTRAINT "FK_Flows_WorkspaceUsers_LastModifiedByUserId" TO "FK_agent_Flows_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_Flows" RENAME CONSTRAINT "PK_Flows" TO "PK_agent_Flows";
                ALTER INDEX "IX_Flows_CreatedByUserId" RENAME TO "IX_agent_Flows_CreatedByUserId";
                ALTER INDEX "IX_Flows_FolderId" RENAME TO "IX_agent_Flows_FolderId";
                ALTER INDEX "IX_Flows_LastModifiedByUserId" RENAME TO "IX_agent_Flows_LastModifiedByUserId";
                ALTER INDEX "IX_Flows_TenantId_Name" RENAME TO "IX_agent_Flows_TenantId_Name";

                ALTER TABLE "FlowVersions" RENAME TO "agent_FlowVersions";
                ALTER TABLE "agent_FlowVersions" RENAME CONSTRAINT "FK_FlowVersions_Flows_FlowId" TO "FK_agent_FlowVersions_agent_Flows_FlowId";
                ALTER TABLE "agent_FlowVersions" RENAME CONSTRAINT "FK_FlowVersions_WorkspaceUsers_CreatedByUserId" TO "FK_agent_FlowVersions_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_FlowVersions" RENAME CONSTRAINT "FK_FlowVersions_WorkspaceUsers_LastModifiedByUserId" TO "FK_agent_FlowVersions_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_FlowVersions" RENAME CONSTRAINT "PK_FlowVersions" TO "PK_agent_FlowVersions";
                ALTER INDEX "IX_FlowVersions_CreatedByUserId" RENAME TO "IX_agent_FlowVersions_CreatedByUserId";
                ALTER INDEX "IX_FlowVersions_FlowId" RENAME TO "IX_agent_FlowVersions_FlowId";
                ALTER INDEX "IX_FlowVersions_LastModifiedByUserId" RENAME TO "IX_agent_FlowVersions_LastModifiedByUserId";

                ALTER TABLE "worc_FlowVersionHistory" RENAME TO "agent_FlowVersionHistory";
                ALTER TABLE "agent_FlowVersionHistory" RENAME CONSTRAINT "FK_worc_FlowVersionHistory_FlowVersions_FlowVersionId" TO "FK_agent_FlowVersionHistory_agent_FlowVersions_FlowVersionId";
                ALTER TABLE "agent_FlowVersionHistory" RENAME CONSTRAINT "FK_worc_FlowVersionHistory_WorkspaceUsers_CreatedByUserId" TO "FK_agent_FlowVersionHistory_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_FlowVersionHistory" RENAME CONSTRAINT "FK_worc_FlowVersionHistory_WorkspaceUsers_LastModifiedByUserId" TO "FK_agent_FlowVersionHistory_user_WorkspaceUsers_LastModifiedBy~";
                ALTER TABLE "agent_FlowVersionHistory" RENAME CONSTRAINT "PK_worc_FlowVersionHistory" TO "PK_agent_FlowVersionHistory";
                ALTER INDEX "IX_worc_FlowVersionHistory_CreatedByUserId" RENAME TO "IX_agent_FlowVersionHistory_CreatedByUserId";
                ALTER INDEX "IX_worc_FlowVersionHistory_FlowVersionId" RENAME TO "IX_agent_FlowVersionHistory_FlowVersionId";
                ALTER INDEX "IX_worc_FlowVersionHistory_LastModifiedByUserId" RENAME TO "IX_agent_FlowVersionHistory_LastModifiedByUserId";

                ALTER TABLE "Folders" RENAME TO "agent_Folders";
                ALTER TABLE "agent_Folders" RENAME CONSTRAINT "FK_Folders_WorkspaceUsers_CreatedByUserId" TO "FK_agent_Folders_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_Folders" RENAME CONSTRAINT "FK_Folders_WorkspaceUsers_LastModifiedByUserId" TO "FK_agent_Folders_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_Folders" RENAME CONSTRAINT "PK_Folders" TO "PK_agent_Folders";
                ALTER INDEX "IX_Folders_CreatedByUserId" RENAME TO "IX_agent_Folders_CreatedByUserId";
                ALTER INDEX "IX_Folders_LastModifiedByUserId" RENAME TO "IX_agent_Folders_LastModifiedByUserId";

                ALTER TABLE "worc_AgentRiskRegistry" RENAME TO "agent_RiskRegistry";
                ALTER TABLE "agent_RiskRegistry" RENAME CONSTRAINT "FK_worc_AgentRiskRegistry_WorkspaceUsers_CreatedByUserId" TO "FK_agent_RiskRegistry_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_RiskRegistry" RENAME CONSTRAINT "FK_worc_AgentRiskRegistry_WorkspaceUsers_LastModifiedByUserId" TO "FK_agent_RiskRegistry_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_RiskRegistry" RENAME CONSTRAINT "PK_worc_AgentRiskRegistry" TO "PK_agent_RiskRegistry";
                ALTER INDEX "IX_worc_AgentRiskRegistry_CreatedByUserId" RENAME TO "IX_agent_RiskRegistry_CreatedByUserId";
                ALTER INDEX "IX_worc_AgentRiskRegistry_FlowVersionId" RENAME TO "IX_agent_RiskRegistry_FlowVersionId";
                ALTER INDEX "IX_worc_AgentRiskRegistry_LastModifiedByUserId" RENAME TO "IX_agent_RiskRegistry_LastModifiedByUserId";

                ALTER TABLE "ws_ResourceFlowAccess" RENAME TO "agent_ResourceFlowAccess";
                ALTER TABLE "agent_ResourceFlowAccess" RENAME CONSTRAINT "FK_ws_ResourceFlowAccess_Flows_FlowId" TO "FK_agent_ResourceFlowAccess_agent_Flows_FlowId";
                ALTER TABLE "agent_ResourceFlowAccess" RENAME CONSTRAINT "FK_ws_ResourceFlowAccess_WorkspaceUsers_CreatedByUserId" TO "FK_agent_ResourceFlowAccess_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_ResourceFlowAccess" RENAME CONSTRAINT "PK_ws_ResourceFlowAccess" TO "PK_agent_ResourceFlowAccess";
                ALTER INDEX "IX_ws_ResourceFlowAccess_CreatedByUserId" RENAME TO "IX_agent_ResourceFlowAccess_CreatedByUserId";
                ALTER INDEX "IX_ws_ResourceFlowAccess_FlowId" RENAME TO "IX_agent_ResourceFlowAccess_FlowId";
                ALTER INDEX "IX_ws_ResourceFlowAccess_TenantId_ResourceType_ResourceId_Flow~" RENAME TO "IX_agent_ResourceFlowAccess_TenantId_ResourceType_ResourceId_F~";

                ALTER TABLE "worc_ProjectTemplates" RENAME TO "agent_FlowTemplates";
                ALTER TABLE "agent_FlowTemplates" RENAME CONSTRAINT "FK_worc_ProjectTemplates_WorkspaceUsers_CreatedByUserId" TO "FK_agent_FlowTemplates_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_FlowTemplates" RENAME CONSTRAINT "FK_worc_ProjectTemplates_WorkspaceUsers_LastModifiedByUserId" TO "FK_agent_FlowTemplates_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_FlowTemplates" RENAME CONSTRAINT "PK_worc_ProjectTemplates" TO "PK_agent_FlowTemplates";
                ALTER INDEX "IX_worc_ProjectTemplates_CreatedByUserId" RENAME TO "IX_agent_FlowTemplates_CreatedByUserId";
                ALTER INDEX "IX_worc_ProjectTemplates_LastModifiedByUserId" RENAME TO "IX_agent_FlowTemplates_LastModifiedByUserId";

                ALTER TABLE "worc_TemplateResources" RENAME TO "agent_FlowTemplateResources";
                ALTER TABLE "agent_FlowTemplateResources" RENAME CONSTRAINT "FK_worc_TemplateResources_WorkspaceUsers_CreatedByUserId" TO "FK_agent_FlowTemplateResources_user_WorkspaceUsers_CreatedByUs~";
                ALTER TABLE "agent_FlowTemplateResources" RENAME CONSTRAINT "FK_worc_TemplateResources_WorkspaceUsers_LastModifiedByUserId" TO "FK_agent_FlowTemplateResources_user_WorkspaceUsers_LastModifie~";
                ALTER TABLE "agent_FlowTemplateResources" RENAME CONSTRAINT "FK_worc_TemplateResources_worc_ProjectTemplates_ProjectTemplat~" TO "FK_agent_FlowTemplateResources_agent_FlowTemplates_ProjectTemp~";
                ALTER TABLE "agent_FlowTemplateResources" RENAME CONSTRAINT "PK_worc_TemplateResources" TO "PK_agent_FlowTemplateResources";
                ALTER INDEX "IX_worc_TemplateResources_CreatedByUserId" RENAME TO "IX_agent_FlowTemplateResources_CreatedByUserId";
                ALTER INDEX "IX_worc_TemplateResources_LastModifiedByUserId" RENAME TO "IX_agent_FlowTemplateResources_LastModifiedByUserId";
                ALTER INDEX "IX_worc_TemplateResources_ProjectTemplateId" RENAME TO "IX_agent_FlowTemplateResources_ProjectTemplateId";

                ALTER TABLE "ws_ApiKeys" RENAME TO "run_ApiKeys";
                ALTER TABLE "run_ApiKeys" RENAME CONSTRAINT "FK_ws_ApiKeys_WorkspaceUsers_CreatedByUserId" TO "FK_run_ApiKeys_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_ApiKeys" RENAME CONSTRAINT "FK_ws_ApiKeys_WorkspaceUsers_LastModifiedByUserId" TO "FK_run_ApiKeys_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_ApiKeys" RENAME CONSTRAINT "PK_ws_ApiKeys" TO "PK_run_ApiKeys";
                ALTER INDEX "IX_ws_ApiKeys_CreatedByUserId" RENAME TO "IX_run_ApiKeys_CreatedByUserId";
                ALTER INDEX "IX_ws_ApiKeys_KeyHash" RENAME TO "IX_run_ApiKeys_KeyHash";
                ALTER INDEX "IX_ws_ApiKeys_LastModifiedByUserId" RENAME TO "IX_run_ApiKeys_LastModifiedByUserId";

                ALTER TABLE "ws_Jobs" RENAME TO "run_Jobs";
                ALTER TABLE "run_Jobs" RENAME CONSTRAINT "FK_ws_Jobs_FlowVersions_FlowVersionId" TO "FK_run_Jobs_agent_FlowVersions_FlowVersionId";
                ALTER TABLE "run_Jobs" RENAME CONSTRAINT "FK_ws_Jobs_Machines_MachineId" TO "FK_run_Jobs_run_Machines_MachineId";
                ALTER TABLE "run_Jobs" RENAME CONSTRAINT "FK_ws_Jobs_worc_FlowVersionHistory_FlowVersionHistoryId" TO "FK_run_Jobs_agent_FlowVersionHistory_FlowVersionHistoryId";
                ALTER TABLE "run_Jobs" RENAME CONSTRAINT "PK_ws_Jobs" TO "PK_run_Jobs";
                ALTER INDEX "IX_ws_Jobs_FlowVersionHistoryId" RENAME TO "IX_run_Jobs_FlowVersionHistoryId";
                ALTER INDEX "IX_ws_Jobs_FlowVersionId" RENAME TO "IX_run_Jobs_FlowVersionId";
                ALTER INDEX "IX_ws_Jobs_MachineId" RENAME TO "IX_run_Jobs_MachineId";

                ALTER TABLE "ws_JobNodeExecutionLogs" RENAME TO "run_JobNodeExecutionLogs";
                ALTER TABLE "run_JobNodeExecutionLogs" RENAME CONSTRAINT "FK_ws_JobNodeExecutionLogs_ws_Jobs_JobId" TO "FK_run_JobNodeExecutionLogs_run_Jobs_JobId";
                ALTER TABLE "run_JobNodeExecutionLogs" RENAME CONSTRAINT "PK_ws_JobNodeExecutionLogs" TO "PK_run_JobNodeExecutionLogs";
                ALTER INDEX "IX_ws_JobNodeExecutionLogs_JobId" RENAME TO "IX_run_JobNodeExecutionLogs_JobId";
                ALTER INDEX "IX_ws_JobNodeExecutionLogs_TenantId_JobId_NodeId_NodeExecution~" RENAME TO "IX_run_JobNodeExecutionLogs_TenantId_JobId_NodeId_NodeExecutio~";

                ALTER TABLE "worc_Triggers" RENAME TO "run_Triggers";
                ALTER TABLE "run_Triggers" RENAME CONSTRAINT "FK_worc_Triggers_WorkspaceUsers_CreatedByUserId" TO "FK_run_Triggers_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_Triggers" RENAME CONSTRAINT "FK_worc_Triggers_WorkspaceUsers_LastModifiedByUserId" TO "FK_run_Triggers_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_Triggers" RENAME CONSTRAINT "PK_worc_Triggers" TO "PK_run_Triggers";
                ALTER INDEX "IX_worc_Triggers_CreatedByUserId" RENAME TO "IX_run_Triggers_CreatedByUserId";
                ALTER INDEX "IX_worc_Triggers_LastModifiedByUserId" RENAME TO "IX_run_Triggers_LastModifiedByUserId";
                ALTER INDEX "IX_worc_Triggers_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_run_Triggers_TenantId_SpaceId_EnvType_Name";

                ALTER TABLE "worc_TriggerFlowVersions" RENAME TO "run_TriggerFlowVersions";
                ALTER TABLE "run_TriggerFlowVersions" RENAME CONSTRAINT "FK_worc_TriggerFlowVersions_FlowVersions_FlowVersionId" TO "FK_run_TriggerFlowVersions_agent_FlowVersions_FlowVersionId";
                ALTER TABLE "run_TriggerFlowVersions" RENAME CONSTRAINT "FK_worc_TriggerFlowVersions_WorkspaceUsers_CreatedByUserId" TO "FK_run_TriggerFlowVersions_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_TriggerFlowVersions" RENAME CONSTRAINT "FK_worc_TriggerFlowVersions_WorkspaceUsers_LastModifiedByUserId" TO "FK_run_TriggerFlowVersions_user_WorkspaceUsers_LastModifiedByU~";
                ALTER TABLE "run_TriggerFlowVersions" RENAME CONSTRAINT "FK_worc_TriggerFlowVersions_worc_Triggers_TriggerId" TO "FK_run_TriggerFlowVersions_run_Triggers_TriggerId";
                ALTER TABLE "run_TriggerFlowVersions" RENAME CONSTRAINT "PK_worc_TriggerFlowVersions" TO "PK_run_TriggerFlowVersions";
                ALTER INDEX "IX_worc_TriggerFlowVersions_CreatedByUserId" RENAME TO "IX_run_TriggerFlowVersions_CreatedByUserId";
                ALTER INDEX "IX_worc_TriggerFlowVersions_FlowVersionId" RENAME TO "IX_run_TriggerFlowVersions_FlowVersionId";
                ALTER INDEX "IX_worc_TriggerFlowVersions_LastModifiedByUserId" RENAME TO "IX_run_TriggerFlowVersions_LastModifiedByUserId";
                ALTER INDEX "IX_worc_TriggerFlowVersions_TriggerId" RENAME TO "IX_run_TriggerFlowVersions_TriggerId";

                ALTER TABLE "Queues" RENAME TO "run_Queues";
                ALTER TABLE "run_Queues" RENAME CONSTRAINT "FK_Queues_WorkspaceUsers_CreatedByUserId" TO "FK_run_Queues_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_Queues" RENAME CONSTRAINT "FK_Queues_WorkspaceUsers_LastModifiedByUserId" TO "FK_run_Queues_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_Queues" RENAME CONSTRAINT "PK_Queues" TO "PK_run_Queues";
                ALTER INDEX "IX_Queues_CreatedByUserId" RENAME TO "IX_run_Queues_CreatedByUserId";
                ALTER INDEX "IX_Queues_LastModifiedByUserId" RENAME TO "IX_run_Queues_LastModifiedByUserId";
                ALTER INDEX "IX_Queues_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_run_Queues_TenantId_SpaceId_EnvType_Name";

                ALTER TABLE "QueueTransactions" RENAME TO "run_QueueWorkItems";
                ALTER TABLE "run_QueueWorkItems" RENAME CONSTRAINT "FK_QueueTransactions_FlowVersions_FlowVersionId" TO "FK_run_QueueWorkItems_agent_FlowVersions_FlowVersionId";
                ALTER TABLE "run_QueueWorkItems" RENAME CONSTRAINT "FK_QueueTransactions_Queues_QueueId" TO "FK_run_QueueWorkItems_run_Queues_QueueId";
                ALTER TABLE "run_QueueWorkItems" RENAME CONSTRAINT "PK_QueueTransactions" TO "PK_run_QueueWorkItems";
                ALTER INDEX "IX_QueueTransactions_FlowVersionId" RENAME TO "IX_run_QueueWorkItems_FlowVersionId";
                ALTER INDEX "IX_QueueTransactions_QueueId" RENAME TO "IX_run_QueueWorkItems_QueueId";
                ALTER INDEX "IX_QueueTransactions_SourceWorkItemId_RetryCount" RENAME TO "IX_run_QueueWorkItems_SourceWorkItemId_RetryCount";

                ALTER TABLE "worc_QueueTransactionEvents" RENAME TO "run_QueueWorkItemEvents";
                ALTER TABLE "run_QueueWorkItemEvents" RENAME CONSTRAINT "FK_worc_QueueTransactionEvents_QueueTransactions_QueueTransact~" TO "FK_run_QueueWorkItemEvents_run_QueueWorkItems_QueueTransaction~";
                ALTER TABLE "run_QueueWorkItemEvents" RENAME CONSTRAINT "FK_worc_QueueTransactionEvents_WorkspaceUsers_CreatedByUserId" TO "FK_run_QueueWorkItemEvents_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_QueueWorkItemEvents" RENAME CONSTRAINT "FK_worc_QueueTransactionEvents_WorkspaceUsers_LastModifiedByUs~" TO "FK_run_QueueWorkItemEvents_user_WorkspaceUsers_LastModifiedByU~";
                ALTER TABLE "run_QueueWorkItemEvents" RENAME CONSTRAINT "PK_worc_QueueTransactionEvents" TO "PK_run_QueueWorkItemEvents";
                ALTER INDEX "IX_worc_QueueTransactionEvents_CreatedByUserId" RENAME TO "IX_run_QueueWorkItemEvents_CreatedByUserId";
                ALTER INDEX "IX_worc_QueueTransactionEvents_LastModifiedByUserId" RENAME TO "IX_run_QueueWorkItemEvents_LastModifiedByUserId";
                ALTER INDEX "IX_worc_QueueTransactionEvents_QueueTransactionId" RENAME TO "IX_run_QueueWorkItemEvents_QueueTransactionId";

                ALTER TABLE "Machines" RENAME TO "run_Machines";
                ALTER TABLE "run_Machines" RENAME CONSTRAINT "FK_Machines_WorkspaceUsers_UserId" TO "FK_run_Machines_user_WorkspaceUsers_UserId";
                ALTER TABLE "run_Machines" RENAME CONSTRAINT "PK_Machines" TO "PK_run_Machines";
                ALTER INDEX "IX_Machines_Name" RENAME TO "IX_run_Machines_Name";
                ALTER INDEX "IX_Machines_UserId" RENAME TO "IX_run_Machines_UserId";

                ALTER TABLE "ConfigStores" RENAME TO "run_ConfigStore";
                ALTER TABLE "run_ConfigStore" RENAME CONSTRAINT "FK_ConfigStores_WorkspaceUsers_CreatedByUserId" TO "FK_run_ConfigStore_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_ConfigStore" RENAME CONSTRAINT "FK_ConfigStores_WorkspaceUsers_LastModifiedByUserId" TO "FK_run_ConfigStore_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_ConfigStore" RENAME CONSTRAINT "PK_ConfigStores" TO "PK_run_ConfigStore";
                ALTER INDEX "IX_ConfigStores_CreatedByUserId" RENAME TO "IX_run_ConfigStore_CreatedByUserId";
                ALTER INDEX "IX_ConfigStores_LastModifiedByUserId" RENAME TO "IX_run_ConfigStore_LastModifiedByUserId";
                ALTER INDEX "IX_ConfigStores_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_run_ConfigStore_TenantId_SpaceId_EnvType_Name";

                ALTER TABLE "Machine_FlowVersion" RENAME TO "run_MachineFlowVersions";
                ALTER TABLE "run_MachineFlowVersions" RENAME CONSTRAINT "FK_Machine_FlowVersion_FlowVersions_FlowVersionId" TO "FK_run_MachineFlowVersions_agent_FlowVersions_FlowVersionId";
                ALTER TABLE "run_MachineFlowVersions" RENAME CONSTRAINT "FK_Machine_FlowVersion_Machines_MachineId" TO "FK_run_MachineFlowVersions_run_Machines_MachineId";
                ALTER TABLE "run_MachineFlowVersions" RENAME CONSTRAINT "PK_Machine_FlowVersion" TO "PK_run_MachineFlowVersions";
                ALTER INDEX "IX_Machine_FlowVersion_FlowVersionId" RENAME TO "IX_run_MachineFlowVersions_FlowVersionId";

                ALTER TABLE "worc_Conversations" RENAME TO "run_Conversations";
                ALTER TABLE "run_Conversations" RENAME CONSTRAINT "FK_worc_Conversations_FlowVersions_FlowVersionId" TO "FK_run_Conversations_agent_FlowVersions_FlowVersionId";
                ALTER TABLE "run_Conversations" RENAME CONSTRAINT "FK_worc_Conversations_WorkspaceUsers_CreatedByUserId" TO "FK_run_Conversations_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_Conversations" RENAME CONSTRAINT "FK_worc_Conversations_WorkspaceUsers_LastModifiedByUserId" TO "FK_run_Conversations_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_Conversations" RENAME CONSTRAINT "FK_worc_Conversations_WorkspaceUsers_UserId" TO "FK_run_Conversations_user_WorkspaceUsers_UserId";
                ALTER TABLE "run_Conversations" RENAME CONSTRAINT "PK_worc_Conversations" TO "PK_run_Conversations";
                ALTER INDEX "IX_worc_Conversations_CreatedByUserId" RENAME TO "IX_run_Conversations_CreatedByUserId";
                ALTER INDEX "IX_worc_Conversations_FlowVersionId" RENAME TO "IX_run_Conversations_FlowVersionId";
                ALTER INDEX "IX_worc_Conversations_LastModifiedByUserId" RENAME TO "IX_run_Conversations_LastModifiedByUserId";
                ALTER INDEX "IX_worc_Conversations_UserId" RENAME TO "IX_run_Conversations_UserId";

                ALTER TABLE "worc_ConversationMessages" RENAME TO "run_ConversationMessages";
                ALTER TABLE "run_ConversationMessages" RENAME CONSTRAINT "FK_worc_ConversationMessages_worc_Conversations_ConversationId" TO "FK_run_ConversationMessages_run_Conversations_ConversationId";
                ALTER TABLE "run_ConversationMessages" RENAME CONSTRAINT "PK_worc_ConversationMessages" TO "PK_run_ConversationMessages";
                ALTER INDEX "IX_worc_ConversationMessages_ConversationId" RENAME TO "IX_run_ConversationMessages_ConversationId";

                ALTER TABLE "worc_KBs" RENAME TO "ai_KnowledgeBases";
                ALTER TABLE "ai_KnowledgeBases" RENAME CONSTRAINT "FK_worc_KBs_WorkspaceUsers_CreatedByUserId" TO "FK_ai_KnowledgeBases_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_KnowledgeBases" RENAME CONSTRAINT "FK_worc_KBs_WorkspaceUsers_LastModifiedByUserId" TO "FK_ai_KnowledgeBases_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_KnowledgeBases" RENAME CONSTRAINT "PK_worc_KBs" TO "PK_ai_KnowledgeBases";
                ALTER INDEX "IX_worc_KBs_CreatedByUserId" RENAME TO "IX_ai_KnowledgeBases_CreatedByUserId";
                ALTER INDEX "IX_worc_KBs_LastModifiedByUserId" RENAME TO "IX_ai_KnowledgeBases_LastModifiedByUserId";
                ALTER INDEX "IX_worc_KBs_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_ai_KnowledgeBases_TenantId_SpaceId_EnvType_Name";

                ALTER TABLE "worc_KBFiles" RENAME TO "ai_KnowledgeBaseFiles";
                ALTER TABLE "ai_KnowledgeBaseFiles" RENAME CONSTRAINT "FK_worc_KBFiles_WorkspaceUsers_CreatedByUserId" TO "FK_ai_KnowledgeBaseFiles_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_KnowledgeBaseFiles" RENAME CONSTRAINT "FK_worc_KBFiles_WorkspaceUsers_LastModifiedByUserId" TO "FK_ai_KnowledgeBaseFiles_user_WorkspaceUsers_LastModifiedByUse~";
                ALTER TABLE "ai_KnowledgeBaseFiles" RENAME CONSTRAINT "FK_worc_KBFiles_worc_KBs_KnowledgeBaseId" TO "FK_ai_KnowledgeBaseFiles_ai_KnowledgeBases_KnowledgeBaseId";
                ALTER TABLE "ai_KnowledgeBaseFiles" RENAME CONSTRAINT "PK_worc_KBFiles" TO "PK_ai_KnowledgeBaseFiles";
                ALTER INDEX "IX_worc_KBFiles_CreatedByUserId" RENAME TO "IX_ai_KnowledgeBaseFiles_CreatedByUserId";
                ALTER INDEX "IX_worc_KBFiles_KnowledgeBaseId_FileName" RENAME TO "IX_ai_KnowledgeBaseFiles_KnowledgeBaseId_FileName";
                ALTER INDEX "IX_worc_KBFiles_LastModifiedByUserId" RENAME TO "IX_ai_KnowledgeBaseFiles_LastModifiedByUserId";

                ALTER TABLE "worc_VectorStore" RENAME TO "ai_VectorStore";
                ALTER TABLE "ai_VectorStore" RENAME CONSTRAINT "PK_worc_VectorStore" TO "PK_ai_VectorStore";

                ALTER TABLE "ws_Tools" RENAME TO "ai_Tools";
                ALTER TABLE "ai_Tools" RENAME CONSTRAINT "FK_ws_Tools_WorkspaceUsers_CreatedByUserId" TO "FK_ai_Tools_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_Tools" RENAME CONSTRAINT "FK_ws_Tools_WorkspaceUsers_LastModifiedByUserId" TO "FK_ai_Tools_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_Tools" RENAME CONSTRAINT "PK_ws_Tools" TO "PK_ai_Tools";
                ALTER INDEX "IX_ws_Tools_CreatedByUserId" RENAME TO "IX_ai_Tools_CreatedByUserId";
                ALTER INDEX "IX_ws_Tools_LastModifiedByUserId" RENAME TO "IX_ai_Tools_LastModifiedByUserId";
                ALTER INDEX "IX_ws_Tools_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_ai_Tools_TenantId_SpaceId_EnvType_Name";

                ALTER TABLE "worc_Skills" RENAME TO "ai_Skills";
                ALTER TABLE "ai_Skills" RENAME CONSTRAINT "FK_worc_Skills_WorkspaceUsers_CreatedByUserId" TO "FK_ai_Skills_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_Skills" RENAME CONSTRAINT "FK_worc_Skills_WorkspaceUsers_LastModifiedByUserId" TO "FK_ai_Skills_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_Skills" RENAME CONSTRAINT "PK_worc_Skills" TO "PK_ai_Skills";
                ALTER INDEX "IX_worc_Skills_CreatedByUserId" RENAME TO "IX_ai_Skills_CreatedByUserId";
                ALTER INDEX "IX_worc_Skills_LastModifiedByUserId" RENAME TO "IX_ai_Skills_LastModifiedByUserId";
                ALTER INDEX "IX_worc_Skills_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_ai_Skills_TenantId_SpaceId_EnvType_Name";

                ALTER TABLE "worc_SkillFiles" RENAME TO "ai_SkillFiles";
                ALTER TABLE "ai_SkillFiles" RENAME CONSTRAINT "FK_worc_SkillFiles_WorkspaceUsers_CreatedByUserId" TO "FK_ai_SkillFiles_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_SkillFiles" RENAME CONSTRAINT "FK_worc_SkillFiles_WorkspaceUsers_LastModifiedByUserId" TO "FK_ai_SkillFiles_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_SkillFiles" RENAME CONSTRAINT "FK_worc_SkillFiles_worc_Skills_SkillId" TO "FK_ai_SkillFiles_ai_Skills_SkillId";
                ALTER TABLE "ai_SkillFiles" RENAME CONSTRAINT "PK_worc_SkillFiles" TO "PK_ai_SkillFiles";
                ALTER INDEX "IX_worc_SkillFiles_CreatedByUserId" RENAME TO "IX_ai_SkillFiles_CreatedByUserId";
                ALTER INDEX "IX_worc_SkillFiles_LastModifiedByUserId" RENAME TO "IX_ai_SkillFiles_LastModifiedByUserId";
                ALTER INDEX "IX_worc_SkillFiles_SkillId_FileName" RENAME TO "IX_ai_SkillFiles_SkillId_FileName";

                ALTER TABLE "worc_TenantModelProviders" RENAME TO "ai_ModelProviders";
                ALTER TABLE "ai_ModelProviders" RENAME CONSTRAINT "FK_worc_TenantModelProviders_WorkspaceUsers_CreatedByUserId" TO "FK_ai_ModelProviders_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_ModelProviders" RENAME CONSTRAINT "FK_worc_TenantModelProviders_WorkspaceUsers_LastModifiedByUser~" TO "FK_ai_ModelProviders_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_ModelProviders" RENAME CONSTRAINT "PK_worc_TenantModelProviders" TO "PK_ai_ModelProviders";
                ALTER INDEX "IX_worc_TenantModelProviders_CreatedByUserId" RENAME TO "IX_ai_ModelProviders_CreatedByUserId";
                ALTER INDEX "IX_worc_TenantModelProviders_LastModifiedByUserId" RENAME TO "IX_ai_ModelProviders_LastModifiedByUserId";

                ALTER TABLE "worc_OnPremModels" RENAME TO "ai_OnPremModels";
                ALTER TABLE "ai_OnPremModels" RENAME CONSTRAINT "FK_worc_OnPremModels_WorkspaceUsers_CreatedByUserId" TO "FK_ai_OnPremModels_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_OnPremModels" RENAME CONSTRAINT "FK_worc_OnPremModels_WorkspaceUsers_LastModifiedByUserId" TO "FK_ai_OnPremModels_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_OnPremModels" RENAME CONSTRAINT "PK_worc_OnPremModels" TO "PK_ai_OnPremModels";
                ALTER INDEX "IX_worc_OnPremModels_CreatedByUserId" RENAME TO "IX_ai_OnPremModels_CreatedByUserId";
                ALTER INDEX "IX_worc_OnPremModels_LastModifiedByUserId" RENAME TO "IX_ai_OnPremModels_LastModifiedByUserId";

                ALTER TABLE "ws_VaultCredentials" RENAME TO "vault_Credentials";
                ALTER TABLE "vault_Credentials" RENAME CONSTRAINT "FK_ws_VaultCredentials_WorkspaceUsers_CreatedByUserId" TO "FK_vault_Credentials_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "vault_Credentials" RENAME CONSTRAINT "FK_ws_VaultCredentials_WorkspaceUsers_LastModifiedByUserId" TO "FK_vault_Credentials_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "vault_Credentials" RENAME CONSTRAINT "PK_ws_VaultCredentials" TO "PK_vault_Credentials";
                ALTER INDEX "IX_ws_VaultCredentials_CreatedByUserId" RENAME TO "IX_vault_Credentials_CreatedByUserId";
                ALTER INDEX "IX_ws_VaultCredentials_LastModifiedByUserId" RENAME TO "IX_vault_Credentials_LastModifiedByUserId";
                ALTER INDEX "IX_ws_VaultCredentials_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_vault_Credentials_TenantId_SpaceId_EnvType_Name";

                ALTER TABLE "ws_EncryptedKeyValues" RENAME TO "vault_EncryptedKeyValues";
                ALTER TABLE "vault_EncryptedKeyValues" RENAME CONSTRAINT "FK_ws_EncryptedKeyValues_ws_VaultCredentials_VaultCredentialId" TO "FK_vault_EncryptedKeyValues_vault_Credentials_VaultCredentialId";
                ALTER TABLE "vault_EncryptedKeyValues" RENAME CONSTRAINT "PK_ws_EncryptedKeyValues" TO "PK_vault_EncryptedKeyValues";
                ALTER INDEX "IX_ws_EncryptedKeyValues_VaultCredentialId" RENAME TO "IX_vault_EncryptedKeyValues_VaultCredentialId";

                ALTER TABLE "WorkspaceUsers" RENAME TO "user_WorkspaceUsers";
                ALTER TABLE "user_WorkspaceUsers" RENAME CONSTRAINT "PK_WorkspaceUsers" TO "PK_user_WorkspaceUsers";
                ALTER INDEX "IX_WorkspaceUsers_UserName" RENAME TO "IX_user_WorkspaceUsers_UserName";

                ALTER TABLE "worc_ResourceShares" RENAME TO "user_ResourceUserAccess";
                ALTER TABLE "user_ResourceUserAccess" RENAME CONSTRAINT "FK_worc_ResourceShares_WorkspaceUsers_UserId" TO "FK_user_ResourceUserAccess_user_WorkspaceUsers_UserId";
                ALTER TABLE "user_ResourceUserAccess" RENAME CONSTRAINT "PK_worc_ResourceShares" TO "PK_user_ResourceUserAccess";
                ALTER INDEX "IX_worc_ResourceShares_ResourceId_UserId" RENAME TO "IX_user_ResourceUserAccess_ResourceId_UserId";
                ALTER INDEX "IX_worc_ResourceShares_UserId" RENAME TO "IX_user_ResourceUserAccess_UserId";

                ALTER TABLE "Notifications" RENAME TO "support_Notifications";
                ALTER TABLE "support_Notifications" RENAME CONSTRAINT "FK_Notifications_WorkspaceUsers_CreatedByUserId" TO "FK_support_Notifications_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "support_Notifications" RENAME CONSTRAINT "FK_Notifications_WorkspaceUsers_LastModifiedByUserId" TO "FK_support_Notifications_user_WorkspaceUsers_LastModifiedByUse~";
                ALTER TABLE "support_Notifications" RENAME CONSTRAINT "PK_Notifications" TO "PK_support_Notifications";
                ALTER INDEX "IX_Notifications_CreatedByUserId" RENAME TO "IX_support_Notifications_CreatedByUserId";
                ALTER INDEX "IX_Notifications_LastModifiedByUserId" RENAME TO "IX_support_Notifications_LastModifiedByUserId";

                ALTER TABLE "NotificationUsers" RENAME TO "support_NotificationUsers";
                ALTER TABLE "support_NotificationUsers" RENAME CONSTRAINT "FK_NotificationUsers_Notifications_NotificationId" TO "FK_support_NotificationUsers_support_Notifications_Notificatio~";
                ALTER TABLE "support_NotificationUsers" RENAME CONSTRAINT "FK_NotificationUsers_WorkspaceUsers_UserId" TO "FK_support_NotificationUsers_user_WorkspaceUsers_UserId";
                ALTER TABLE "support_NotificationUsers" RENAME CONSTRAINT "PK_NotificationUsers" TO "PK_support_NotificationUsers";
                ALTER INDEX "IX_NotificationUsers_NotificationId" RENAME TO "IX_support_NotificationUsers_NotificationId";
                ALTER INDEX "IX_NotificationUsers_UserId" RENAME TO "IX_support_NotificationUsers_UserId";

                ALTER TABLE "ws_Ticket" RENAME TO "support_Tickets";
                ALTER TABLE "support_Tickets" RENAME CONSTRAINT "FK_ws_Ticket_WorkspaceUsers_CreatedByUserId" TO "FK_support_Tickets_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "support_Tickets" RENAME CONSTRAINT "FK_ws_Ticket_WorkspaceUsers_LastModifiedByUserId" TO "FK_support_Tickets_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "support_Tickets" RENAME CONSTRAINT "PK_ws_Ticket" TO "PK_support_Tickets";
                ALTER INDEX "IX_ws_Ticket_CreatedByUserId" RENAME TO "IX_support_Tickets_CreatedByUserId";
                ALTER INDEX "IX_ws_Ticket_LastModifiedByUserId" RENAME TO "IX_support_Tickets_LastModifiedByUserId";
                ALTER INDEX "IX_ws_Ticket_TicketNumber" RENAME TO "IX_support_Tickets_TicketNumber";

                ALTER TABLE "ws_TicketAttachment" RENAME TO "support_TicketAttachments";
                ALTER TABLE "support_TicketAttachments" RENAME CONSTRAINT "FK_ws_TicketAttachment_ws_Ticket_TicketId" TO "FK_support_TicketAttachments_support_Tickets_TicketId";
                ALTER TABLE "support_TicketAttachments" RENAME CONSTRAINT "PK_ws_TicketAttachment" TO "PK_support_TicketAttachments";
                ALTER INDEX "IX_ws_TicketAttachment_TicketId" RENAME TO "IX_support_TicketAttachments_TicketId";

                ALTER TABLE "ws_TicketComment" RENAME TO "support_TicketComments";
                ALTER TABLE "support_TicketComments" RENAME CONSTRAINT "FK_ws_TicketComment_WorkspaceUsers_CreatedByUserId" TO "FK_support_TicketComments_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "support_TicketComments" RENAME CONSTRAINT "FK_ws_TicketComment_WorkspaceUsers_LastModifiedByUserId" TO "FK_support_TicketComments_user_WorkspaceUsers_LastModifiedByUs~";
                ALTER TABLE "support_TicketComments" RENAME CONSTRAINT "FK_ws_TicketComment_ws_Ticket_TicketId" TO "FK_support_TicketComments_support_Tickets_TicketId";
                ALTER TABLE "support_TicketComments" RENAME CONSTRAINT "PK_ws_TicketComment" TO "PK_support_TicketComments";
                ALTER INDEX "IX_ws_TicketComment_CreatedByUserId" RENAME TO "IX_support_TicketComments_CreatedByUserId";
                ALTER INDEX "IX_ws_TicketComment_LastModifiedByUserId" RENAME TO "IX_support_TicketComments_LastModifiedByUserId";
                ALTER INDEX "IX_ws_TicketComment_TicketId" RENAME TO "IX_support_TicketComments_TicketId";

                ALTER TABLE "ws_TicketHistory" RENAME TO "support_TicketHistory";
                ALTER TABLE "support_TicketHistory" RENAME CONSTRAINT "FK_ws_TicketHistory_ws_Ticket_TicketId" TO "FK_support_TicketHistory_support_Tickets_TicketId";
                ALTER TABLE "support_TicketHistory" RENAME CONSTRAINT "PK_ws_TicketHistory" TO "PK_support_TicketHistory";
                ALTER INDEX "IX_ws_TicketHistory_TicketId" RENAME TO "IX_support_TicketHistory_TicketId";

                ALTER TABLE "FlowUsers" RENAME CONSTRAINT "FK_FlowUsers_Flows_FlowId" TO "FK_FlowUsers_agent_Flows_FlowId";
                ALTER TABLE "FlowUsers" RENAME CONSTRAINT "FK_FlowUsers_WorkspaceUsers_CreatedByUserId" TO "FK_FlowUsers_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "FlowUsers" RENAME CONSTRAINT "FK_FlowUsers_WorkspaceUsers_LastModifiedByUserId" TO "FK_FlowUsers_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "FlowUsers" RENAME CONSTRAINT "FK_FlowUsers_WorkspaceUsers_UserId" TO "FK_FlowUsers_user_WorkspaceUsers_UserId";

                ALTER TABLE "worc_QueueUsers" RENAME CONSTRAINT "FK_worc_QueueUsers_Queues_QueueId" TO "FK_worc_QueueUsers_run_Queues_QueueId";
                ALTER TABLE "worc_QueueUsers" RENAME CONSTRAINT "FK_worc_QueueUsers_WorkspaceUsers_CreatedByUserId" TO "FK_worc_QueueUsers_user_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "worc_QueueUsers" RENAME CONSTRAINT "FK_worc_QueueUsers_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_QueueUsers_user_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "worc_QueueUsers" RENAME CONSTRAINT "FK_worc_QueueUsers_WorkspaceUsers_UserId" TO "FK_worc_QueueUsers_user_WorkspaceUsers_UserId";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE "worc_QueueUsers" RENAME CONSTRAINT "FK_worc_QueueUsers_run_Queues_QueueId" TO "FK_worc_QueueUsers_Queues_QueueId";
                ALTER TABLE "worc_QueueUsers" RENAME CONSTRAINT "FK_worc_QueueUsers_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_QueueUsers_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "worc_QueueUsers" RENAME CONSTRAINT "FK_worc_QueueUsers_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_QueueUsers_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "worc_QueueUsers" RENAME CONSTRAINT "FK_worc_QueueUsers_user_WorkspaceUsers_UserId" TO "FK_worc_QueueUsers_WorkspaceUsers_UserId";

                ALTER TABLE "FlowUsers" RENAME CONSTRAINT "FK_FlowUsers_agent_Flows_FlowId" TO "FK_FlowUsers_Flows_FlowId";
                ALTER TABLE "FlowUsers" RENAME CONSTRAINT "FK_FlowUsers_user_WorkspaceUsers_CreatedByUserId" TO "FK_FlowUsers_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "FlowUsers" RENAME CONSTRAINT "FK_FlowUsers_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_FlowUsers_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "FlowUsers" RENAME CONSTRAINT "FK_FlowUsers_user_WorkspaceUsers_UserId" TO "FK_FlowUsers_WorkspaceUsers_UserId";

                ALTER INDEX "IX_support_TicketHistory_TicketId" RENAME TO "IX_ws_TicketHistory_TicketId";
                ALTER TABLE "support_TicketHistory" RENAME CONSTRAINT "FK_support_TicketHistory_support_Tickets_TicketId" TO "FK_ws_TicketHistory_ws_Ticket_TicketId";
                ALTER TABLE "support_TicketHistory" RENAME CONSTRAINT "PK_support_TicketHistory" TO "PK_ws_TicketHistory";
                ALTER TABLE "support_TicketHistory" RENAME TO "ws_TicketHistory";

                ALTER INDEX "IX_support_TicketComments_CreatedByUserId" RENAME TO "IX_ws_TicketComment_CreatedByUserId";
                ALTER INDEX "IX_support_TicketComments_LastModifiedByUserId" RENAME TO "IX_ws_TicketComment_LastModifiedByUserId";
                ALTER INDEX "IX_support_TicketComments_TicketId" RENAME TO "IX_ws_TicketComment_TicketId";
                ALTER TABLE "support_TicketComments" RENAME CONSTRAINT "FK_support_TicketComments_user_WorkspaceUsers_CreatedByUserId" TO "FK_ws_TicketComment_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "support_TicketComments" RENAME CONSTRAINT "FK_support_TicketComments_user_WorkspaceUsers_LastModifiedByUs~" TO "FK_ws_TicketComment_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "support_TicketComments" RENAME CONSTRAINT "FK_support_TicketComments_support_Tickets_TicketId" TO "FK_ws_TicketComment_ws_Ticket_TicketId";
                ALTER TABLE "support_TicketComments" RENAME CONSTRAINT "PK_support_TicketComments" TO "PK_ws_TicketComment";
                ALTER TABLE "support_TicketComments" RENAME TO "ws_TicketComment";

                ALTER INDEX "IX_support_TicketAttachments_TicketId" RENAME TO "IX_ws_TicketAttachment_TicketId";
                ALTER TABLE "support_TicketAttachments" RENAME CONSTRAINT "FK_support_TicketAttachments_support_Tickets_TicketId" TO "FK_ws_TicketAttachment_ws_Ticket_TicketId";
                ALTER TABLE "support_TicketAttachments" RENAME CONSTRAINT "PK_support_TicketAttachments" TO "PK_ws_TicketAttachment";
                ALTER TABLE "support_TicketAttachments" RENAME TO "ws_TicketAttachment";

                ALTER INDEX "IX_support_Tickets_CreatedByUserId" RENAME TO "IX_ws_Ticket_CreatedByUserId";
                ALTER INDEX "IX_support_Tickets_LastModifiedByUserId" RENAME TO "IX_ws_Ticket_LastModifiedByUserId";
                ALTER INDEX "IX_support_Tickets_TicketNumber" RENAME TO "IX_ws_Ticket_TicketNumber";
                ALTER TABLE "support_Tickets" RENAME CONSTRAINT "FK_support_Tickets_user_WorkspaceUsers_CreatedByUserId" TO "FK_ws_Ticket_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "support_Tickets" RENAME CONSTRAINT "FK_support_Tickets_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_ws_Ticket_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "support_Tickets" RENAME CONSTRAINT "PK_support_Tickets" TO "PK_ws_Ticket";
                ALTER TABLE "support_Tickets" RENAME TO "ws_Ticket";

                ALTER INDEX "IX_support_NotificationUsers_NotificationId" RENAME TO "IX_NotificationUsers_NotificationId";
                ALTER INDEX "IX_support_NotificationUsers_UserId" RENAME TO "IX_NotificationUsers_UserId";
                ALTER TABLE "support_NotificationUsers" RENAME CONSTRAINT "FK_support_NotificationUsers_support_Notifications_Notificatio~" TO "FK_NotificationUsers_Notifications_NotificationId";
                ALTER TABLE "support_NotificationUsers" RENAME CONSTRAINT "FK_support_NotificationUsers_user_WorkspaceUsers_UserId" TO "FK_NotificationUsers_WorkspaceUsers_UserId";
                ALTER TABLE "support_NotificationUsers" RENAME CONSTRAINT "PK_support_NotificationUsers" TO "PK_NotificationUsers";
                ALTER TABLE "support_NotificationUsers" RENAME TO "NotificationUsers";

                ALTER INDEX "IX_support_Notifications_CreatedByUserId" RENAME TO "IX_Notifications_CreatedByUserId";
                ALTER INDEX "IX_support_Notifications_LastModifiedByUserId" RENAME TO "IX_Notifications_LastModifiedByUserId";
                ALTER TABLE "support_Notifications" RENAME CONSTRAINT "FK_support_Notifications_user_WorkspaceUsers_CreatedByUserId" TO "FK_Notifications_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "support_Notifications" RENAME CONSTRAINT "FK_support_Notifications_user_WorkspaceUsers_LastModifiedByUse~" TO "FK_Notifications_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "support_Notifications" RENAME CONSTRAINT "PK_support_Notifications" TO "PK_Notifications";
                ALTER TABLE "support_Notifications" RENAME TO "Notifications";

                ALTER INDEX "IX_user_ResourceUserAccess_ResourceId_UserId" RENAME TO "IX_worc_ResourceShares_ResourceId_UserId";
                ALTER INDEX "IX_user_ResourceUserAccess_UserId" RENAME TO "IX_worc_ResourceShares_UserId";
                ALTER TABLE "user_ResourceUserAccess" RENAME CONSTRAINT "FK_user_ResourceUserAccess_user_WorkspaceUsers_UserId" TO "FK_worc_ResourceShares_WorkspaceUsers_UserId";
                ALTER TABLE "user_ResourceUserAccess" RENAME CONSTRAINT "PK_user_ResourceUserAccess" TO "PK_worc_ResourceShares";
                ALTER TABLE "user_ResourceUserAccess" RENAME TO "worc_ResourceShares";

                ALTER INDEX "IX_user_WorkspaceUsers_UserName" RENAME TO "IX_WorkspaceUsers_UserName";
                ALTER TABLE "user_WorkspaceUsers" RENAME CONSTRAINT "PK_user_WorkspaceUsers" TO "PK_WorkspaceUsers";
                ALTER TABLE "user_WorkspaceUsers" RENAME TO "WorkspaceUsers";

                ALTER INDEX "IX_vault_EncryptedKeyValues_VaultCredentialId" RENAME TO "IX_ws_EncryptedKeyValues_VaultCredentialId";
                ALTER TABLE "vault_EncryptedKeyValues" RENAME CONSTRAINT "FK_vault_EncryptedKeyValues_vault_Credentials_VaultCredentialId" TO "FK_ws_EncryptedKeyValues_ws_VaultCredentials_VaultCredentialId";
                ALTER TABLE "vault_EncryptedKeyValues" RENAME CONSTRAINT "PK_vault_EncryptedKeyValues" TO "PK_ws_EncryptedKeyValues";
                ALTER TABLE "vault_EncryptedKeyValues" RENAME TO "ws_EncryptedKeyValues";

                ALTER INDEX "IX_vault_Credentials_CreatedByUserId" RENAME TO "IX_ws_VaultCredentials_CreatedByUserId";
                ALTER INDEX "IX_vault_Credentials_LastModifiedByUserId" RENAME TO "IX_ws_VaultCredentials_LastModifiedByUserId";
                ALTER INDEX "IX_vault_Credentials_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_ws_VaultCredentials_TenantId_SpaceId_EnvType_Name";
                ALTER TABLE "vault_Credentials" RENAME CONSTRAINT "FK_vault_Credentials_user_WorkspaceUsers_CreatedByUserId" TO "FK_ws_VaultCredentials_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "vault_Credentials" RENAME CONSTRAINT "FK_vault_Credentials_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_ws_VaultCredentials_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "vault_Credentials" RENAME CONSTRAINT "PK_vault_Credentials" TO "PK_ws_VaultCredentials";
                ALTER TABLE "vault_Credentials" RENAME TO "ws_VaultCredentials";

                ALTER INDEX "IX_ai_OnPremModels_CreatedByUserId" RENAME TO "IX_worc_OnPremModels_CreatedByUserId";
                ALTER INDEX "IX_ai_OnPremModels_LastModifiedByUserId" RENAME TO "IX_worc_OnPremModels_LastModifiedByUserId";
                ALTER TABLE "ai_OnPremModels" RENAME CONSTRAINT "FK_ai_OnPremModels_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_OnPremModels_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_OnPremModels" RENAME CONSTRAINT "FK_ai_OnPremModels_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_OnPremModels_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_OnPremModels" RENAME CONSTRAINT "PK_ai_OnPremModels" TO "PK_worc_OnPremModels";
                ALTER TABLE "ai_OnPremModels" RENAME TO "worc_OnPremModels";

                ALTER INDEX "IX_ai_ModelProviders_CreatedByUserId" RENAME TO "IX_worc_TenantModelProviders_CreatedByUserId";
                ALTER INDEX "IX_ai_ModelProviders_LastModifiedByUserId" RENAME TO "IX_worc_TenantModelProviders_LastModifiedByUserId";
                ALTER TABLE "ai_ModelProviders" RENAME CONSTRAINT "FK_ai_ModelProviders_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_TenantModelProviders_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_ModelProviders" RENAME CONSTRAINT "FK_ai_ModelProviders_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_TenantModelProviders_WorkspaceUsers_LastModifiedByUser~";
                ALTER TABLE "ai_ModelProviders" RENAME CONSTRAINT "PK_ai_ModelProviders" TO "PK_worc_TenantModelProviders";
                ALTER TABLE "ai_ModelProviders" RENAME TO "worc_TenantModelProviders";

                ALTER INDEX "IX_ai_SkillFiles_CreatedByUserId" RENAME TO "IX_worc_SkillFiles_CreatedByUserId";
                ALTER INDEX "IX_ai_SkillFiles_LastModifiedByUserId" RENAME TO "IX_worc_SkillFiles_LastModifiedByUserId";
                ALTER INDEX "IX_ai_SkillFiles_SkillId_FileName" RENAME TO "IX_worc_SkillFiles_SkillId_FileName";
                ALTER TABLE "ai_SkillFiles" RENAME CONSTRAINT "FK_ai_SkillFiles_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_SkillFiles_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_SkillFiles" RENAME CONSTRAINT "FK_ai_SkillFiles_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_SkillFiles_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_SkillFiles" RENAME CONSTRAINT "FK_ai_SkillFiles_ai_Skills_SkillId" TO "FK_worc_SkillFiles_worc_Skills_SkillId";
                ALTER TABLE "ai_SkillFiles" RENAME CONSTRAINT "PK_ai_SkillFiles" TO "PK_worc_SkillFiles";
                ALTER TABLE "ai_SkillFiles" RENAME TO "worc_SkillFiles";

                ALTER INDEX "IX_ai_Skills_CreatedByUserId" RENAME TO "IX_worc_Skills_CreatedByUserId";
                ALTER INDEX "IX_ai_Skills_LastModifiedByUserId" RENAME TO "IX_worc_Skills_LastModifiedByUserId";
                ALTER INDEX "IX_ai_Skills_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_worc_Skills_TenantId_SpaceId_EnvType_Name";
                ALTER TABLE "ai_Skills" RENAME CONSTRAINT "FK_ai_Skills_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_Skills_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_Skills" RENAME CONSTRAINT "FK_ai_Skills_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_Skills_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_Skills" RENAME CONSTRAINT "PK_ai_Skills" TO "PK_worc_Skills";
                ALTER TABLE "ai_Skills" RENAME TO "worc_Skills";

                ALTER INDEX "IX_ai_Tools_CreatedByUserId" RENAME TO "IX_ws_Tools_CreatedByUserId";
                ALTER INDEX "IX_ai_Tools_LastModifiedByUserId" RENAME TO "IX_ws_Tools_LastModifiedByUserId";
                ALTER INDEX "IX_ai_Tools_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_ws_Tools_TenantId_SpaceId_EnvType_Name";
                ALTER TABLE "ai_Tools" RENAME CONSTRAINT "FK_ai_Tools_user_WorkspaceUsers_CreatedByUserId" TO "FK_ws_Tools_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_Tools" RENAME CONSTRAINT "FK_ai_Tools_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_ws_Tools_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_Tools" RENAME CONSTRAINT "PK_ai_Tools" TO "PK_ws_Tools";
                ALTER TABLE "ai_Tools" RENAME TO "ws_Tools";

                ALTER TABLE "ai_VectorStore" RENAME CONSTRAINT "PK_ai_VectorStore" TO "PK_worc_VectorStore";
                ALTER TABLE "ai_VectorStore" RENAME TO "worc_VectorStore";

                ALTER INDEX "IX_ai_KnowledgeBaseFiles_CreatedByUserId" RENAME TO "IX_worc_KBFiles_CreatedByUserId";
                ALTER INDEX "IX_ai_KnowledgeBaseFiles_KnowledgeBaseId_FileName" RENAME TO "IX_worc_KBFiles_KnowledgeBaseId_FileName";
                ALTER INDEX "IX_ai_KnowledgeBaseFiles_LastModifiedByUserId" RENAME TO "IX_worc_KBFiles_LastModifiedByUserId";
                ALTER TABLE "ai_KnowledgeBaseFiles" RENAME CONSTRAINT "FK_ai_KnowledgeBaseFiles_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_KBFiles_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_KnowledgeBaseFiles" RENAME CONSTRAINT "FK_ai_KnowledgeBaseFiles_user_WorkspaceUsers_LastModifiedByUse~" TO "FK_worc_KBFiles_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_KnowledgeBaseFiles" RENAME CONSTRAINT "FK_ai_KnowledgeBaseFiles_ai_KnowledgeBases_KnowledgeBaseId" TO "FK_worc_KBFiles_worc_KBs_KnowledgeBaseId";
                ALTER TABLE "ai_KnowledgeBaseFiles" RENAME CONSTRAINT "PK_ai_KnowledgeBaseFiles" TO "PK_worc_KBFiles";
                ALTER TABLE "ai_KnowledgeBaseFiles" RENAME TO "worc_KBFiles";

                ALTER INDEX "IX_ai_KnowledgeBases_CreatedByUserId" RENAME TO "IX_worc_KBs_CreatedByUserId";
                ALTER INDEX "IX_ai_KnowledgeBases_LastModifiedByUserId" RENAME TO "IX_worc_KBs_LastModifiedByUserId";
                ALTER INDEX "IX_ai_KnowledgeBases_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_worc_KBs_TenantId_SpaceId_EnvType_Name";
                ALTER TABLE "ai_KnowledgeBases" RENAME CONSTRAINT "FK_ai_KnowledgeBases_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_KBs_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "ai_KnowledgeBases" RENAME CONSTRAINT "FK_ai_KnowledgeBases_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_KBs_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "ai_KnowledgeBases" RENAME CONSTRAINT "PK_ai_KnowledgeBases" TO "PK_worc_KBs";
                ALTER TABLE "ai_KnowledgeBases" RENAME TO "worc_KBs";

                ALTER INDEX "IX_run_ConversationMessages_ConversationId" RENAME TO "IX_worc_ConversationMessages_ConversationId";
                ALTER TABLE "run_ConversationMessages" RENAME CONSTRAINT "FK_run_ConversationMessages_run_Conversations_ConversationId" TO "FK_worc_ConversationMessages_worc_Conversations_ConversationId";
                ALTER TABLE "run_ConversationMessages" RENAME CONSTRAINT "PK_run_ConversationMessages" TO "PK_worc_ConversationMessages";
                ALTER TABLE "run_ConversationMessages" RENAME TO "worc_ConversationMessages";

                ALTER INDEX "IX_run_Conversations_CreatedByUserId" RENAME TO "IX_worc_Conversations_CreatedByUserId";
                ALTER INDEX "IX_run_Conversations_FlowVersionId" RENAME TO "IX_worc_Conversations_FlowVersionId";
                ALTER INDEX "IX_run_Conversations_LastModifiedByUserId" RENAME TO "IX_worc_Conversations_LastModifiedByUserId";
                ALTER INDEX "IX_run_Conversations_UserId" RENAME TO "IX_worc_Conversations_UserId";
                ALTER TABLE "run_Conversations" RENAME CONSTRAINT "FK_run_Conversations_agent_FlowVersions_FlowVersionId" TO "FK_worc_Conversations_FlowVersions_FlowVersionId";
                ALTER TABLE "run_Conversations" RENAME CONSTRAINT "FK_run_Conversations_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_Conversations_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_Conversations" RENAME CONSTRAINT "FK_run_Conversations_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_Conversations_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_Conversations" RENAME CONSTRAINT "FK_run_Conversations_user_WorkspaceUsers_UserId" TO "FK_worc_Conversations_WorkspaceUsers_UserId";
                ALTER TABLE "run_Conversations" RENAME CONSTRAINT "PK_run_Conversations" TO "PK_worc_Conversations";
                ALTER TABLE "run_Conversations" RENAME TO "worc_Conversations";

                ALTER INDEX "IX_run_MachineFlowVersions_FlowVersionId" RENAME TO "IX_Machine_FlowVersion_FlowVersionId";
                ALTER TABLE "run_MachineFlowVersions" RENAME CONSTRAINT "FK_run_MachineFlowVersions_agent_FlowVersions_FlowVersionId" TO "FK_Machine_FlowVersion_FlowVersions_FlowVersionId";
                ALTER TABLE "run_MachineFlowVersions" RENAME CONSTRAINT "FK_run_MachineFlowVersions_run_Machines_MachineId" TO "FK_Machine_FlowVersion_Machines_MachineId";
                ALTER TABLE "run_MachineFlowVersions" RENAME CONSTRAINT "PK_run_MachineFlowVersions" TO "PK_Machine_FlowVersion";
                ALTER TABLE "run_MachineFlowVersions" RENAME TO "Machine_FlowVersion";

                ALTER INDEX "IX_run_ConfigStore_CreatedByUserId" RENAME TO "IX_ConfigStores_CreatedByUserId";
                ALTER INDEX "IX_run_ConfigStore_LastModifiedByUserId" RENAME TO "IX_ConfigStores_LastModifiedByUserId";
                ALTER INDEX "IX_run_ConfigStore_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_ConfigStores_TenantId_SpaceId_EnvType_Name";
                ALTER TABLE "run_ConfigStore" RENAME CONSTRAINT "FK_run_ConfigStore_user_WorkspaceUsers_CreatedByUserId" TO "FK_ConfigStores_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_ConfigStore" RENAME CONSTRAINT "FK_run_ConfigStore_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_ConfigStores_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_ConfigStore" RENAME CONSTRAINT "PK_run_ConfigStore" TO "PK_ConfigStores";
                ALTER TABLE "run_ConfigStore" RENAME TO "ConfigStores";

                ALTER INDEX "IX_run_Machines_Name" RENAME TO "IX_Machines_Name";
                ALTER INDEX "IX_run_Machines_UserId" RENAME TO "IX_Machines_UserId";
                ALTER TABLE "run_Machines" RENAME CONSTRAINT "FK_run_Machines_user_WorkspaceUsers_UserId" TO "FK_Machines_WorkspaceUsers_UserId";
                ALTER TABLE "run_Machines" RENAME CONSTRAINT "PK_run_Machines" TO "PK_Machines";
                ALTER TABLE "run_Machines" RENAME TO "Machines";

                ALTER INDEX "IX_run_QueueWorkItemEvents_CreatedByUserId" RENAME TO "IX_worc_QueueTransactionEvents_CreatedByUserId";
                ALTER INDEX "IX_run_QueueWorkItemEvents_LastModifiedByUserId" RENAME TO "IX_worc_QueueTransactionEvents_LastModifiedByUserId";
                ALTER INDEX "IX_run_QueueWorkItemEvents_QueueTransactionId" RENAME TO "IX_worc_QueueTransactionEvents_QueueTransactionId";
                ALTER TABLE "run_QueueWorkItemEvents" RENAME CONSTRAINT "FK_run_QueueWorkItemEvents_run_QueueWorkItems_QueueTransaction~" TO "FK_worc_QueueTransactionEvents_QueueTransactions_QueueTransact~";
                ALTER TABLE "run_QueueWorkItemEvents" RENAME CONSTRAINT "FK_run_QueueWorkItemEvents_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_QueueTransactionEvents_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_QueueWorkItemEvents" RENAME CONSTRAINT "FK_run_QueueWorkItemEvents_user_WorkspaceUsers_LastModifiedByU~" TO "FK_worc_QueueTransactionEvents_WorkspaceUsers_LastModifiedByUs~";
                ALTER TABLE "run_QueueWorkItemEvents" RENAME CONSTRAINT "PK_run_QueueWorkItemEvents" TO "PK_worc_QueueTransactionEvents";
                ALTER TABLE "run_QueueWorkItemEvents" RENAME TO "worc_QueueTransactionEvents";

                ALTER INDEX "IX_run_QueueWorkItems_FlowVersionId" RENAME TO "IX_QueueTransactions_FlowVersionId";
                ALTER INDEX "IX_run_QueueWorkItems_QueueId" RENAME TO "IX_QueueTransactions_QueueId";
                ALTER INDEX "IX_run_QueueWorkItems_SourceWorkItemId_RetryCount" RENAME TO "IX_QueueTransactions_SourceWorkItemId_RetryCount";
                ALTER TABLE "run_QueueWorkItems" RENAME CONSTRAINT "FK_run_QueueWorkItems_agent_FlowVersions_FlowVersionId" TO "FK_QueueTransactions_FlowVersions_FlowVersionId";
                ALTER TABLE "run_QueueWorkItems" RENAME CONSTRAINT "FK_run_QueueWorkItems_run_Queues_QueueId" TO "FK_QueueTransactions_Queues_QueueId";
                ALTER TABLE "run_QueueWorkItems" RENAME CONSTRAINT "PK_run_QueueWorkItems" TO "PK_QueueTransactions";
                ALTER TABLE "run_QueueWorkItems" RENAME TO "QueueTransactions";

                ALTER INDEX "IX_run_Queues_CreatedByUserId" RENAME TO "IX_Queues_CreatedByUserId";
                ALTER INDEX "IX_run_Queues_LastModifiedByUserId" RENAME TO "IX_Queues_LastModifiedByUserId";
                ALTER INDEX "IX_run_Queues_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_Queues_TenantId_SpaceId_EnvType_Name";
                ALTER TABLE "run_Queues" RENAME CONSTRAINT "FK_run_Queues_user_WorkspaceUsers_CreatedByUserId" TO "FK_Queues_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_Queues" RENAME CONSTRAINT "FK_run_Queues_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_Queues_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_Queues" RENAME CONSTRAINT "PK_run_Queues" TO "PK_Queues";
                ALTER TABLE "run_Queues" RENAME TO "Queues";

                ALTER INDEX "IX_run_TriggerFlowVersions_CreatedByUserId" RENAME TO "IX_worc_TriggerFlowVersions_CreatedByUserId";
                ALTER INDEX "IX_run_TriggerFlowVersions_FlowVersionId" RENAME TO "IX_worc_TriggerFlowVersions_FlowVersionId";
                ALTER INDEX "IX_run_TriggerFlowVersions_LastModifiedByUserId" RENAME TO "IX_worc_TriggerFlowVersions_LastModifiedByUserId";
                ALTER INDEX "IX_run_TriggerFlowVersions_TriggerId" RENAME TO "IX_worc_TriggerFlowVersions_TriggerId";
                ALTER TABLE "run_TriggerFlowVersions" RENAME CONSTRAINT "FK_run_TriggerFlowVersions_agent_FlowVersions_FlowVersionId" TO "FK_worc_TriggerFlowVersions_FlowVersions_FlowVersionId";
                ALTER TABLE "run_TriggerFlowVersions" RENAME CONSTRAINT "FK_run_TriggerFlowVersions_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_TriggerFlowVersions_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_TriggerFlowVersions" RENAME CONSTRAINT "FK_run_TriggerFlowVersions_user_WorkspaceUsers_LastModifiedByU~" TO "FK_worc_TriggerFlowVersions_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_TriggerFlowVersions" RENAME CONSTRAINT "FK_run_TriggerFlowVersions_run_Triggers_TriggerId" TO "FK_worc_TriggerFlowVersions_worc_Triggers_TriggerId";
                ALTER TABLE "run_TriggerFlowVersions" RENAME CONSTRAINT "PK_run_TriggerFlowVersions" TO "PK_worc_TriggerFlowVersions";
                ALTER TABLE "run_TriggerFlowVersions" RENAME TO "worc_TriggerFlowVersions";

                ALTER INDEX "IX_run_Triggers_CreatedByUserId" RENAME TO "IX_worc_Triggers_CreatedByUserId";
                ALTER INDEX "IX_run_Triggers_LastModifiedByUserId" RENAME TO "IX_worc_Triggers_LastModifiedByUserId";
                ALTER INDEX "IX_run_Triggers_TenantId_SpaceId_EnvType_Name" RENAME TO "IX_worc_Triggers_TenantId_SpaceId_EnvType_Name";
                ALTER TABLE "run_Triggers" RENAME CONSTRAINT "FK_run_Triggers_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_Triggers_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_Triggers" RENAME CONSTRAINT "FK_run_Triggers_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_Triggers_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_Triggers" RENAME CONSTRAINT "PK_run_Triggers" TO "PK_worc_Triggers";
                ALTER TABLE "run_Triggers" RENAME TO "worc_Triggers";

                ALTER INDEX "IX_run_JobNodeExecutionLogs_JobId" RENAME TO "IX_ws_JobNodeExecutionLogs_JobId";
                ALTER INDEX "IX_run_JobNodeExecutionLogs_TenantId_JobId_NodeId_NodeExecutio~" RENAME TO "IX_ws_JobNodeExecutionLogs_TenantId_JobId_NodeId_NodeExecution~";
                ALTER TABLE "run_JobNodeExecutionLogs" RENAME CONSTRAINT "FK_run_JobNodeExecutionLogs_run_Jobs_JobId" TO "FK_ws_JobNodeExecutionLogs_ws_Jobs_JobId";
                ALTER TABLE "run_JobNodeExecutionLogs" RENAME CONSTRAINT "PK_run_JobNodeExecutionLogs" TO "PK_ws_JobNodeExecutionLogs";
                ALTER TABLE "run_JobNodeExecutionLogs" RENAME TO "ws_JobNodeExecutionLogs";

                ALTER INDEX "IX_run_Jobs_FlowVersionHistoryId" RENAME TO "IX_ws_Jobs_FlowVersionHistoryId";
                ALTER INDEX "IX_run_Jobs_FlowVersionId" RENAME TO "IX_ws_Jobs_FlowVersionId";
                ALTER INDEX "IX_run_Jobs_MachineId" RENAME TO "IX_ws_Jobs_MachineId";
                ALTER TABLE "run_Jobs" RENAME CONSTRAINT "FK_run_Jobs_agent_FlowVersions_FlowVersionId" TO "FK_ws_Jobs_FlowVersions_FlowVersionId";
                ALTER TABLE "run_Jobs" RENAME CONSTRAINT "FK_run_Jobs_run_Machines_MachineId" TO "FK_ws_Jobs_Machines_MachineId";
                ALTER TABLE "run_Jobs" RENAME CONSTRAINT "FK_run_Jobs_agent_FlowVersionHistory_FlowVersionHistoryId" TO "FK_ws_Jobs_worc_FlowVersionHistory_FlowVersionHistoryId";
                ALTER TABLE "run_Jobs" RENAME CONSTRAINT "PK_run_Jobs" TO "PK_ws_Jobs";
                ALTER TABLE "run_Jobs" RENAME TO "ws_Jobs";

                ALTER INDEX "IX_run_ApiKeys_CreatedByUserId" RENAME TO "IX_ws_ApiKeys_CreatedByUserId";
                ALTER INDEX "IX_run_ApiKeys_KeyHash" RENAME TO "IX_ws_ApiKeys_KeyHash";
                ALTER INDEX "IX_run_ApiKeys_LastModifiedByUserId" RENAME TO "IX_ws_ApiKeys_LastModifiedByUserId";
                ALTER TABLE "run_ApiKeys" RENAME CONSTRAINT "FK_run_ApiKeys_user_WorkspaceUsers_CreatedByUserId" TO "FK_ws_ApiKeys_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "run_ApiKeys" RENAME CONSTRAINT "FK_run_ApiKeys_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_ws_ApiKeys_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "run_ApiKeys" RENAME CONSTRAINT "PK_run_ApiKeys" TO "PK_ws_ApiKeys";
                ALTER TABLE "run_ApiKeys" RENAME TO "ws_ApiKeys";

                ALTER INDEX "IX_agent_FlowTemplateResources_CreatedByUserId" RENAME TO "IX_worc_TemplateResources_CreatedByUserId";
                ALTER INDEX "IX_agent_FlowTemplateResources_LastModifiedByUserId" RENAME TO "IX_worc_TemplateResources_LastModifiedByUserId";
                ALTER INDEX "IX_agent_FlowTemplateResources_ProjectTemplateId" RENAME TO "IX_worc_TemplateResources_ProjectTemplateId";
                ALTER TABLE "agent_FlowTemplateResources" RENAME CONSTRAINT "FK_agent_FlowTemplateResources_user_WorkspaceUsers_CreatedByUs~" TO "FK_worc_TemplateResources_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_FlowTemplateResources" RENAME CONSTRAINT "FK_agent_FlowTemplateResources_user_WorkspaceUsers_LastModifie~" TO "FK_worc_TemplateResources_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_FlowTemplateResources" RENAME CONSTRAINT "FK_agent_FlowTemplateResources_agent_FlowTemplates_ProjectTemp~" TO "FK_worc_TemplateResources_worc_ProjectTemplates_ProjectTemplat~";
                ALTER TABLE "agent_FlowTemplateResources" RENAME CONSTRAINT "PK_agent_FlowTemplateResources" TO "PK_worc_TemplateResources";
                ALTER TABLE "agent_FlowTemplateResources" RENAME TO "worc_TemplateResources";

                ALTER INDEX "IX_agent_FlowTemplates_CreatedByUserId" RENAME TO "IX_worc_ProjectTemplates_CreatedByUserId";
                ALTER INDEX "IX_agent_FlowTemplates_LastModifiedByUserId" RENAME TO "IX_worc_ProjectTemplates_LastModifiedByUserId";
                ALTER TABLE "agent_FlowTemplates" RENAME CONSTRAINT "FK_agent_FlowTemplates_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_ProjectTemplates_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_FlowTemplates" RENAME CONSTRAINT "FK_agent_FlowTemplates_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_ProjectTemplates_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_FlowTemplates" RENAME CONSTRAINT "PK_agent_FlowTemplates" TO "PK_worc_ProjectTemplates";
                ALTER TABLE "agent_FlowTemplates" RENAME TO "worc_ProjectTemplates";

                ALTER INDEX "IX_agent_ResourceFlowAccess_CreatedByUserId" RENAME TO "IX_ws_ResourceFlowAccess_CreatedByUserId";
                ALTER INDEX "IX_agent_ResourceFlowAccess_FlowId" RENAME TO "IX_ws_ResourceFlowAccess_FlowId";
                ALTER INDEX "IX_agent_ResourceFlowAccess_TenantId_ResourceType_ResourceId_F~" RENAME TO "IX_ws_ResourceFlowAccess_TenantId_ResourceType_ResourceId_Flow~";
                ALTER TABLE "agent_ResourceFlowAccess" RENAME CONSTRAINT "FK_agent_ResourceFlowAccess_agent_Flows_FlowId" TO "FK_ws_ResourceFlowAccess_Flows_FlowId";
                ALTER TABLE "agent_ResourceFlowAccess" RENAME CONSTRAINT "FK_agent_ResourceFlowAccess_user_WorkspaceUsers_CreatedByUserId" TO "FK_ws_ResourceFlowAccess_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_ResourceFlowAccess" RENAME CONSTRAINT "PK_agent_ResourceFlowAccess" TO "PK_ws_ResourceFlowAccess";
                ALTER TABLE "agent_ResourceFlowAccess" RENAME TO "ws_ResourceFlowAccess";

                ALTER INDEX "IX_agent_RiskRegistry_CreatedByUserId" RENAME TO "IX_worc_AgentRiskRegistry_CreatedByUserId";
                ALTER INDEX "IX_agent_RiskRegistry_FlowVersionId" RENAME TO "IX_worc_AgentRiskRegistry_FlowVersionId";
                ALTER INDEX "IX_agent_RiskRegistry_LastModifiedByUserId" RENAME TO "IX_worc_AgentRiskRegistry_LastModifiedByUserId";
                ALTER TABLE "agent_RiskRegistry" RENAME CONSTRAINT "FK_agent_RiskRegistry_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_AgentRiskRegistry_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_RiskRegistry" RENAME CONSTRAINT "FK_agent_RiskRegistry_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_worc_AgentRiskRegistry_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_RiskRegistry" RENAME CONSTRAINT "PK_agent_RiskRegistry" TO "PK_worc_AgentRiskRegistry";
                ALTER TABLE "agent_RiskRegistry" RENAME TO "worc_AgentRiskRegistry";

                ALTER INDEX "IX_agent_Folders_CreatedByUserId" RENAME TO "IX_Folders_CreatedByUserId";
                ALTER INDEX "IX_agent_Folders_LastModifiedByUserId" RENAME TO "IX_Folders_LastModifiedByUserId";
                ALTER TABLE "agent_Folders" RENAME CONSTRAINT "FK_agent_Folders_user_WorkspaceUsers_CreatedByUserId" TO "FK_Folders_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_Folders" RENAME CONSTRAINT "FK_agent_Folders_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_Folders_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_Folders" RENAME CONSTRAINT "PK_agent_Folders" TO "PK_Folders";
                ALTER TABLE "agent_Folders" RENAME TO "Folders";

                ALTER INDEX "IX_agent_FlowVersionHistory_CreatedByUserId" RENAME TO "IX_worc_FlowVersionHistory_CreatedByUserId";
                ALTER INDEX "IX_agent_FlowVersionHistory_FlowVersionId" RENAME TO "IX_worc_FlowVersionHistory_FlowVersionId";
                ALTER INDEX "IX_agent_FlowVersionHistory_LastModifiedByUserId" RENAME TO "IX_worc_FlowVersionHistory_LastModifiedByUserId";
                ALTER TABLE "agent_FlowVersionHistory" RENAME CONSTRAINT "FK_agent_FlowVersionHistory_agent_FlowVersions_FlowVersionId" TO "FK_worc_FlowVersionHistory_FlowVersions_FlowVersionId";
                ALTER TABLE "agent_FlowVersionHistory" RENAME CONSTRAINT "FK_agent_FlowVersionHistory_user_WorkspaceUsers_CreatedByUserId" TO "FK_worc_FlowVersionHistory_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_FlowVersionHistory" RENAME CONSTRAINT "FK_agent_FlowVersionHistory_user_WorkspaceUsers_LastModifiedBy~" TO "FK_worc_FlowVersionHistory_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_FlowVersionHistory" RENAME CONSTRAINT "PK_agent_FlowVersionHistory" TO "PK_worc_FlowVersionHistory";
                ALTER TABLE "agent_FlowVersionHistory" RENAME TO "worc_FlowVersionHistory";

                ALTER INDEX "IX_agent_FlowVersions_CreatedByUserId" RENAME TO "IX_FlowVersions_CreatedByUserId";
                ALTER INDEX "IX_agent_FlowVersions_FlowId" RENAME TO "IX_FlowVersions_FlowId";
                ALTER INDEX "IX_agent_FlowVersions_LastModifiedByUserId" RENAME TO "IX_FlowVersions_LastModifiedByUserId";
                ALTER TABLE "agent_FlowVersions" RENAME CONSTRAINT "FK_agent_FlowVersions_agent_Flows_FlowId" TO "FK_FlowVersions_Flows_FlowId";
                ALTER TABLE "agent_FlowVersions" RENAME CONSTRAINT "FK_agent_FlowVersions_user_WorkspaceUsers_CreatedByUserId" TO "FK_FlowVersions_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_FlowVersions" RENAME CONSTRAINT "FK_agent_FlowVersions_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_FlowVersions_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_FlowVersions" RENAME CONSTRAINT "PK_agent_FlowVersions" TO "PK_FlowVersions";
                ALTER TABLE "agent_FlowVersions" RENAME TO "FlowVersions";

                ALTER INDEX "IX_agent_Flows_CreatedByUserId" RENAME TO "IX_Flows_CreatedByUserId";
                ALTER INDEX "IX_agent_Flows_FolderId" RENAME TO "IX_Flows_FolderId";
                ALTER INDEX "IX_agent_Flows_LastModifiedByUserId" RENAME TO "IX_Flows_LastModifiedByUserId";
                ALTER INDEX "IX_agent_Flows_TenantId_Name" RENAME TO "IX_Flows_TenantId_Name";
                ALTER TABLE "agent_Flows" RENAME CONSTRAINT "FK_agent_Flows_agent_Folders_FolderId" TO "FK_Flows_Folders_FolderId";
                ALTER TABLE "agent_Flows" RENAME CONSTRAINT "FK_agent_Flows_user_WorkspaceUsers_CreatedByUserId" TO "FK_Flows_WorkspaceUsers_CreatedByUserId";
                ALTER TABLE "agent_Flows" RENAME CONSTRAINT "FK_agent_Flows_user_WorkspaceUsers_LastModifiedByUserId" TO "FK_Flows_WorkspaceUsers_LastModifiedByUserId";
                ALTER TABLE "agent_Flows" RENAME CONSTRAINT "PK_agent_Flows" TO "PK_Flows";
                ALTER TABLE "agent_Flows" RENAME TO "Flows";
                """);
        }
    }
}
