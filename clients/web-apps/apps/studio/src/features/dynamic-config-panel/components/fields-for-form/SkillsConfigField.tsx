import { PuzzlePieceIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { FieldPath, FieldValues, useFormContext, useWatch } from "react-hook-form";

import { getSkillSelectOptions } from "../../apis/skill-registry-apis";
import { useNormalizedIdList } from "../../hooks/useNormalizedIdList.hook";
import { ConfigFieldCard, ConfigFieldCount } from "./ConfigFieldCard";
import { ResourceListField } from "./ResourceListField";

interface SkillsConfigFieldProps {
  /** The name of the form field. */
  name: string;
  /** Renders the body without its card, for a host that frames it. */
  hideGroup?: boolean;
}

const SkillsConfigField = ({ name, hideGroup = false }: SkillsConfigFieldProps) => {
  const skillsFieldName = `${name}.skills` as FieldPath<FieldValues>;

  const { control } = useFormContext();
  const attached = useWatch({ control, name: skillsFieldName });
  const attachedCount = Array.isArray(attached) ? attached.length : 0;

  const { data: skillOptionsData, isLoading } = useQuery({
    queryKey: ["skill-options"],
    queryFn: getSkillSelectOptions,
    select: (response) => response?.data ?? [],
  });

  useNormalizedIdList(skillsFieldName);

  const body = (
    <ResourceListField
      name={skillsFieldName}
      options={skillOptionsData ?? []}
      isLoading={isLoading}
      Icon={PuzzlePieceIcon}
      tone="teal"
      noun={["skill", "skills"]}
      emptyHint="No skills attached yet."
    />
  );

  if (hideGroup) return body;

  return (
    <ConfigFieldCard
      Icon={PuzzlePieceIcon}
      tone="teal"
      label="Uses"
      title="Skills"
      description="Packaged know-how the agent loads when a task calls for it."
      aside={<ConfigFieldCount count={attachedCount} noun="attached" />}
    >
      {body}
    </ConfigFieldCard>
  );
};

SkillsConfigField.displayName = "SkillsConfigField";

export { SkillsConfigField, type SkillsConfigFieldProps };
