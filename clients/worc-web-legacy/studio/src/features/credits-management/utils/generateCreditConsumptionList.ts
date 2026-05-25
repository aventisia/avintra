import { Execution } from "../../flow-execution-log/types/execution-types";
import { CreditServiceTypesEnum } from "../constants/credit-service-type-enum";
import { ExecutionNode } from "../../flow-execution-log/types/execution-types";
import { getAgentExecutionDuration } from "./getAgentExecutionDuration";
import { CreditConsumptionDto } from "../dtos/credit-consumption-dto";
import {
  nodeToServiceTypeMap,
  serviceTypeToUnitMap,
} from "../constants/service-type-node-map";
import { UsageSourceTypesEnum } from "../constants/usage-source-types-enum";
import { ActionTypesEnum } from "../constants/action-types-enum";

/**
 * Generates a list of credit consumption
 * based on flow execution.
 *
 * Filters executed nodes by service type and maps them
 * to consumed unit values. Also includes agent execution
 * cost if postCommand is "complete".
 *
 * @param executionData - Full list of execution logs
 * @param agentId       - Agent's unique identifier
 * @param agentName     - Name of the agent
 * @param versionId     - Version of the agent
 * @param postCommand   - Command to run after execution: "abort" | "complete" | null
 * @returns Array of CreditConsumptionDto or null
 */
export function generateCreditConsumptionList(
  executionData: Execution[],
  agentId: string,
  agentName: string,
  // versionId: string,
  postCommand: "abort" | "complete" | null,
): CreditConsumptionDto[] | null {
  if (!postCommand) return null;

  const nodes: ExecutionNode[] = executionData[0]?.nodes || [];

  if (!agentId || !agentName || !nodes.length) {
    return null;
  }

  const consumptionList: CreditConsumptionDto[] = [];

  // Process executed nodes
  for (const node of nodes) {
    if (!node.isSuccess) continue;

    const serviceType = nodeToServiceTypeMap[node.nodeUniqueName];
    if (!serviceType) continue;

    const consumedUnit = serviceTypeToUnitMap[serviceType];
    if (consumedUnit === undefined) {
      console.warn(
        `Service type '${serviceType}' not tracked for consumption.`,
      );
      continue;
    }

    consumptionList.push({
      serviceType,
      consumedUnit,
      refType: UsageSourceTypesEnum.Agent,
      refId: agentId,
      refName: agentName,
      action: ActionTypesEnum.AgentExecution,
      triggeredByAgent: agentName,
    });
  }

  // Add base agent execution consumption if flow completed
  if (postCommand === "complete") {
    consumptionList.push({
      serviceType: CreditServiceTypesEnum.AgentExecutionTime,
      consumedUnit: getAgentExecutionDuration(nodes, []),
      refType: UsageSourceTypesEnum.Agent,
      refId: agentId,
      refName: agentName,
      action: ActionTypesEnum.AgentExecution,
      triggeredByAgent: agentName,
    });
  }

  return consumptionList.length > 0 ? consumptionList : null;
}
