import { axiosInstance } from "@avplatform/ui/lib";

import { buildCustomToolNodeConfig } from "@/features/action-selector/utils/custom-tool-node-config.util";
import {
  CUSTOM_TOOL_NODE_PREFIX,
  getCustomToolNodeReferenceCandidates,
} from "@/features/action-selector/utils/custom-tool-node-name.util";

import { DCPFieldSchemaType } from "..";
import { UsableToolCatalogItemDto } from "../dtos/tool.dto";
import { NodeConfigSchemaType } from "../types/node-config-schema-type";
import { getUsableToolCatalog } from "./tools.apis";

const modules = {
  ...import.meta.glob("../constants/config-json/*.json"),
  ...import.meta.glob("../constants/custom-config-json/**/*.json"),
};

type NodeConfigValue = DCPFieldSchemaType[] | NodeConfigSchemaType | undefined;

const nodeConfigCache: Record<string, NodeConfigValue> = {};
const nodeConfigInFlight: Record<string, Promise<NodeConfigValue> | undefined> = {};

let usableToolCatalogPromise: Promise<UsableToolCatalogItemDto[] | null> | undefined;

const getUsableToolCatalogOnce = (): Promise<UsableToolCatalogItemDto[] | null> => {
  if (!usableToolCatalogPromise) {
    usableToolCatalogPromise = getUsableToolCatalog()
      .then((res) => (Array.isArray(res.data) ? res.data : null))
      .catch((error) => {
        console.error("Custom tool catalog fetch error:", error);
        return null;
      })
      .finally(() => {
        usableToolCatalogPromise = undefined;
      });
  }
  return usableToolCatalogPromise;
};

const isCustomToolNodeName = (nodeUniqueName: string): boolean => {
  if (nodeUniqueName.startsWith(CUSTOM_TOOL_NODE_PREFIX)) return true;

  const separatorIndex = nodeUniqueName.indexOf(".");
  if (separatorIndex <= 0) return false;
  const toolRef = nodeUniqueName.slice(0, separatorIndex);
  const operationId = nodeUniqueName.slice(separatorIndex + 1);
  const guidPattern =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return guidPattern.test(toolRef) && operationId.length > 0;
};

const getJsonFilepath = (nodeUniqueName: string): string => {
  if (
    nodeUniqueName === "ConditionalActivity" ||
    nodeUniqueName === "ConditionalBranchActivity" ||
    nodeUniqueName === "LoopActivity"
  ) {
    return `../constants/custom-config-json/${nodeUniqueName}.json`;
  }

  if (nodeUniqueName.includes("AIAgent")) {
    return `../constants/custom-config-json/ai-config-json/${nodeUniqueName}.json`;
  }

  return `../constants/config-json/${nodeUniqueName}.json`;
};

const buildSchemaAwareCustomToolConfig = async (
  nodeUniqueName: string,
): Promise<NodeConfigSchemaType | null> => {
  const catalog = await getUsableToolCatalogOnce();
  if (catalog === null) {
    return null;
  }

  for (const reference of getCustomToolNodeReferenceCandidates(nodeUniqueName)) {
    const operation = catalog
      .find((tool) => tool.name === reference.toolName)
      ?.operations?.find((candidate) => candidate.operationId === reference.operationId);
    if (operation) {
      return buildCustomToolNodeConfig(nodeUniqueName, operation, reference);
    }
  }

  return null;
};

/**
 * Gets the node config JSON for a given nodeUniqueName.
 */
export const getNodeConfig = async (nodeUniqueName: string, nodeType?: string) => {
  if (nodeConfigCache[nodeUniqueName]) {
    return nodeConfigCache[nodeUniqueName];
  }

  if (nodeConfigInFlight[nodeUniqueName] !== undefined) {
    return nodeConfigInFlight[nodeUniqueName];
  }

  if (nodeType == "blockNode") {
    const blockConfig = JSON.parse(sessionStorage.getItem("block-config") || "{}");
    return blockConfig[nodeUniqueName];
  }

  if (isCustomToolNodeName(nodeUniqueName)) {
    // IMPORTANT NOTE: custom-tool node configs are rebuilt per open and never cached, so catalog and tenant changes are always reflected.
    const customToolConfig = await buildSchemaAwareCustomToolConfig(nodeUniqueName);
    return customToolConfig ?? buildCustomToolNodeConfig(nodeUniqueName);
  }

  if (nodeUniqueName.length > 9 && nodeUniqueName.slice(-9) === "Connector") {
    // IMPORTANT NOTE: cloud connector configs, including Corsair connectors named "Corsair/{Plugin}/{Action}Connector", are fetched from the Workspace API and have no local JSON.
    const connectorFetch = axiosInstance
      .get(
        `${import.meta.env.VITE_WORKSPACE_API_PATH}/cloud-connector/config-file/${nodeUniqueName}.json`,
      )
      .then((res) => res.data);
    nodeConfigInFlight[nodeUniqueName] = connectorFetch;
    try {
      const connectorConfig = await connectorFetch;
      if (connectorConfig) {
        nodeConfigCache[nodeUniqueName] = connectorConfig;
        return connectorConfig;
      }
    } catch (error) {
      console.error(`Cloud Connector ${nodeUniqueName} fetch error:`, error);
    } finally {
      delete nodeConfigInFlight[nodeUniqueName];
    }
  }

  const namesToTry = [nodeUniqueName];

  if (nodeUniqueName.endsWith("Activity")) {
    namesToTry.push(`${nodeUniqueName.slice(0, -"Activity".length)}Node`);
  }

  for (const name of namesToTry) {
    const jsonFilepath = getJsonFilepath(name);
    const loader = modules[jsonFilepath];

    if (loader) {
      const module = (await loader()) as { default: DCPFieldSchemaType[] };
      nodeConfigCache[nodeUniqueName] = module.default;
      return module.default;
    }
  }

  throw new Error(`No config found for node: ${nodeUniqueName}`);
};
