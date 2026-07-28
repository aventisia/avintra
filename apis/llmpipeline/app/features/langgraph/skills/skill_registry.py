from app.core.logger import logger
from app.features.langgraph.schemas.skill_schema import SkillConfig


class SkillRegistry:
    """
    Stores and manages platform skills discovered from ``SKILL.md`` files.

    A skill is currently a lightweight name/description item that the
    planner uses to decide whether it is relevant for a user request.
    """

    def __init__(self):
        self._skills: dict[str, SkillConfig] = {}

    def register(
        self,
        skill: SkillConfig,
    ) -> None:
        """
        Register a single skill configuration.
        """

        if skill.name in self._skills:
            logger.warning(
                "Replacing existing skill: %s",
                skill.name,
            )

        self._skills[skill.name] = skill

        logger.info(
            "Registered skill: %s",
            skill.name,
        )

    def register_many(
        self,
        skills: list[SkillConfig],
    ) -> None:
        """
        Register multiple skills at once.
        """

        for skill in skills:
            self.register(skill)

    def get(
        self,
        name: str,
    ) -> SkillConfig | None:
        """
        Get a skill configuration by name.
        """

        return self._skills.get(name)

    def get_all(
        self,
    ) -> list[SkillConfig]:
        """
        Get all registered skill configurations.
        """

        return list(self._skills.values())

    def get_active(
        self,
    ) -> list[SkillConfig]:
        """
        Get skills that are available for routing.
        """

        return [
            skill
            for skill in self._skills.values()
            if skill.is_active
        ]

    def exists(
        self,
        name: str,
    ) -> bool:
        """
        Check whether a skill is registered.
        """

        return name in self._skills

    def names(
        self,
    ) -> list[str]:
        """
        Return all registered skill names.
        """

        return list(self._skills.keys())

    def remove(
        self,
        name: str,
    ) -> bool:
        """
        Remove a registered skill.
        """

        if name not in self._skills:
            logger.warning(
                "Skill not found for removal: %s",
                name,
            )
            return False

        del self._skills[name]

        logger.info(
            "Removed skill: %s",
            name,
        )

        return True
