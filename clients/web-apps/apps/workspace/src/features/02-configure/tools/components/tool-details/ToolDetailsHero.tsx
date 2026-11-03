import { Badge } from "@avplatform/ui/badge";
import { MetaLine } from "@avplatform/ui/meta-line";
import { formatDate, formatRelativeTime } from "@avplatform/ui/utils";
import { CircleDashedIcon, SealCheckIcon } from "@phosphor-icons/react";
import { differenceInMinutes } from "date-fns";

import { pluralize } from "@/utils/pluralize.util";

import { AUTHENTICATION_TYPE_DISPLAY_NAMES } from "../../constants/tools-display-names.constant";
import type { ToolDto } from "../../dtos/index";
import { ComponentTypeEnum } from "../../enums/component-type-enum";
import { getToolDisplayName } from "../../utils/tool-name-formatter";
import { ToolIcon } from "../ToolIcon";

const getStateBadge = (tool: ToolDto) => {
  if (tool.isDisabled) return <Badge variant="destructive">Disabled</Badge>;
  if (tool.isActive) {
    return (
      <Badge variant="outline" className="border-ok/35 text-ok">
        Active
      </Badge>
    );
  }
  return <Badge variant="outline">Inactive</Badge>;
};

const VerificationStatus = ({ isVerified }: { isVerified: boolean }) =>
  isVerified ? (
    <span className="inline-flex items-center gap-1 align-bottom font-medium text-ok">
      <SealCheckIcon weight="fill" className="size-3.5" />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 align-bottom">
      <CircleDashedIcon className="size-3.5" />
      Not verified
    </span>
  );

const LastChange = ({ tool }: { tool: ToolDto }) => {
  const isEdited =
    !!tool.lastModifiedOn &&
    (!tool.createdOn ||
      differenceInMinutes(new Date(tool.lastModifiedOn), new Date(tool.createdOn)) >= 1);
  const changedOn = isEdited ? tool.lastModifiedOn : tool.createdOn;
  if (!changedOn) return null;

  return (
    <span title={formatDate(changedOn, true)}>
      {isEdited ? "Updated" : "Created"} {formatRelativeTime(changedOn)}
    </span>
  );
};

type ToolDetailsHeroProps = {
  tool: ToolDto;
  operationCount: number;
};

/**
 * Tool page banner: icon, kind, name, description, verification and state.
 */
export const ToolDetailsHero = ({ tool, operationCount }: ToolDetailsHeroProps) => (
  <section className="relative isolate overflow-hidden rounded-lg bg-surface px-5 py-4 ring-1 ring-line">
    <ToolIcon
      name={tool.name}
      iconUrl={tool.iconUrl}
      className="pointer-events-none absolute -bottom-10 right-28 -z-10 size-40 rotate-[-12deg] object-contain opacity-[0.06] grayscale"
    />
    <div className="flex items-start gap-4">
      <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-popover shadow-sm ring-1 ring-line">
        <ToolIcon
          name={tool.name}
          iconUrl={tool.iconUrl}
          className={tool.isDisabled ? "size-8 object-contain opacity-50" : "size-8 object-contain"}
        />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-mono text-label uppercase text-muted-foreground">
          {tool.type === ComponentTypeEnum.Platform ? "Platform tool" : "Custom tool"}
        </p>
        <h2 className="truncate text-title text-ink">{getToolDisplayName(tool.name)}</h2>
        {tool.description && (
          <p className="mt-0.5 line-clamp-2 max-w-3xl text-[13px] leading-5 text-ink-2">
            {tool.description}
          </p>
        )}
        <MetaLine
          className="mt-2 text-[12px] text-muted-foreground"
          items={[
            <VerificationStatus key="verification" isVerified={tool.isVerified} />,
            `${operationCount} ${pluralize(operationCount, "operation")}`,
            tool.authenticationType && AUTHENTICATION_TYPE_DISPLAY_NAMES[tool.authenticationType],
            <LastChange key="change" tool={tool} />,
          ]}
        />
      </div>
      <div className="shrink-0">{getStateBadge(tool)}</div>
    </div>
  </section>
);
