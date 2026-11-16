import { PersonAvatar } from "@avplatform/ui/avatar";
import { HighlightedText } from "@avplatform/ui/highlighted-text";
import { useDebounce } from "@avplatform/ui/hooks/useDebounce";
import { cn } from "@avplatform/ui/lib";
import { CheckIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { Kbd } from "@/components/Kbd";

import { PickerShell } from "../../../resource-access-shared/components/PickerShell";
import { ResourceUserAccessDraft } from "../../hooks/useResourceUserAccessDraft.hook";
import { useSearchUsersList } from "../../hooks/useSearchUsersList";
import { SharePerson } from "../../types/resource-user-access-draft.type";

type PeoplePickerProps = {
  draft: ResourceUserAccessDraft;
  spaceName: string;
};

/**
 * Search combobox for adding people from the current space to the share list.
 */
export const PeoplePicker = ({ draft, spaceName }: PeoplePickerProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(trimmedQuery);
  const { data, isFetching, isError } = useSearchUsersList(debouncedQuery);
  const isSearching = trimmedQuery !== debouncedQuery || isFetching;

  const people = useMemo<SharePerson[]>(
    () =>
      (data?.data ?? []).map((user) => ({
        userId: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.userName,
        email: user.userName,
      })),
    [data],
  );
  const results = trimmedQuery && !isSearching ? people : [];

  return (
    <PickerShell
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      query={query}
      onQueryChange={setQuery}
      isFetching={Boolean(trimmedQuery) && isSearching}
      inputLabel="Add people by name or email"
      placeholder="Add people by name or email…"
      listLabel="People"
      options={results.map((person) => {
        const pickState = draft.getPickState(person.userId);
        const isShared = pickState === "shared";

        return {
          key: person.userId,
          isSelected: pickState !== "none",
          isDisabled: isShared,
          onPick: () => draft.togglePerson(person),
          content: (
            <>
              <PersonAvatar name={person.name} className="size-8 text-[11px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">
                  <HighlightedText text={person.name} query={debouncedQuery} />
                </span>
                <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
                  <HighlightedText text={person.email} query={debouncedQuery} />
                </span>
              </span>
              {isShared ? (
                <span className="shrink-0 text-[11.5px] font-medium text-muted-foreground">
                  Has access
                </span>
              ) : (
                <span
                  className={cn(
                    "grid size-[18px] shrink-0 place-items-center rounded-sm transition-colors",
                    pickState === "invited"
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-transparent ring-[1.5px] ring-inset ring-line-strong",
                  )}
                >
                  <CheckIcon className="size-3" weight="bold" />
                </span>
              )}
            </>
          ),
        };
      })}
      empty={
        !trimmedQuery ? (
          <li className="px-3 py-7 text-center">
            <p className="text-[13px] font-medium text-ink-2">Find people to add</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Type a name or email. Only people in {spaceName} are listed.
            </p>
          </li>
        ) : isSearching ? (
          <>
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index} className="flex animate-pulse items-center gap-3 px-2 py-2">
                <span className="size-8 rounded-full bg-muted" />
                <span className="flex-1 space-y-1.5">
                  <span className="block h-3 w-2/5 rounded bg-muted" />
                  <span className="block h-2.5 w-1/3 rounded bg-muted" />
                </span>
              </li>
            ))}
          </>
        ) : isError ? (
          <li className="px-3 py-7 text-center text-[13px] text-bad">
            Couldn’t search people. Try again in a moment.
          </li>
        ) : (
          <li className="px-3 py-7 text-center">
            <p className="text-[13px] font-medium text-ink-2">
              No one in {spaceName} matches “{trimmedQuery}”
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              People must be members of this space to get access.
            </p>
          </li>
        )
      }
      footer={
        <>
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            move
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd>
            add
          </span>
          <span className="flex items-center gap-1">
            <Kbd>esc</Kbd>
            close
          </span>
          {draft.added.length > 0 && (
            <span className="ml-auto font-mono tabular-nums">{draft.added.length} to add</span>
          )}
        </>
      }
    />
  );
};
