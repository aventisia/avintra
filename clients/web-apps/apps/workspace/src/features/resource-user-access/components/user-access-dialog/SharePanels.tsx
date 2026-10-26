import { UsersRound } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import {
  AccessEmptyState,
  AnimatedPanel,
  OpenAccessCallout,
  PanelHeading,
  WarningLine,
} from "../../../resource-access-shared/components/AccessPanelParts";
import { PANEL_TRANSITION } from "../../../resource-access-shared/constants/access-ui.constant";
import { ResourceUserAccessDraft } from "../../hooks/useResourceUserAccessDraft.hook";
import { PeoplePicker } from "./PeoplePicker";
import { SharePersonRow } from "./SharePersonRow";

type SharePanelsProps = {
  draft: ResourceUserAccessDraft;
  spaceName: string;
};

/**
 * Animated people list or everyone callout below the share mode radio group.
 */
export const SharePanels = ({ draft, spaceName }: SharePanelsProps) => {
  const activeCount = draft.rows.filter((row) => row.change !== "removed").length;

  return (
    <AnimatePresence initial={false} mode="wait">
      {draft.isOpenAccess ? (
        <AnimatedPanel key="open">
          <div className="pb-1 pt-4">
            <OpenAccessCallout
              title={`Everyone in ${spaceName} can view`}
              description={
                <>
                  Includes people who join later. Choose{" "}
                  <span className="font-medium text-emerald-900">Specific people</span> to pick who
                  gets access.
                </>
              }
            />
            {draft.hasPeopleChanges && (
              <WarningLine>Your edits to the people list aren’t saved with Everyone.</WarningLine>
            )}
          </div>
        </AnimatedPanel>
      ) : (
        <AnimatedPanel key="restricted">
          <div className="pb-1 pt-5">
            <PeoplePicker draft={draft} spaceName={spaceName} />
            {draft.isModeChanged && (
              <WarningLine>{`Others in ${spaceName} lose access once you save.`}</WarningLine>
            )}

            <PanelHeading title="People with access" count={activeCount} />

            {draft.rows.length === 0 ? (
              <AccessEmptyState
                icon={UsersRound}
                title="No one has access yet"
                description={<>Search above to add people from {spaceName}.</>}
              />
            ) : (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl bg-popover ring-1 ring-border">
                <AnimatePresence initial={false}>
                  {draft.rows.map((row) => (
                    <motion.li
                      key={row.key}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={PANEL_TRANSITION}
                      className="overflow-hidden"
                    >
                      <SharePersonRow row={row} draft={draft} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </AnimatedPanel>
      )}
    </AnimatePresence>
  );
};
