from app.core.logger import logger
from app.features.langgraph.schemas.skill_schema import SkillConfig


class SkillRegistry:
    """
    Stores and manages platform skills discovered from ``SKILL.md`` files.

    A skill is currently a lightweight name/description item that the
    planner uses to decide whether it is relevant for a user request.

    User-created skills loaded from the database are kept in a separate
    tenant-scoped namespace so that they can be refreshed per request and
    do not collide with globally-defined filesystem skills.
    """

    def __init__(self):
        self._skills: dict[str, SkillConfig] = {}
        self._user_skills: dict[str, dict[str, SkillConfig]] = {}

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

    def names_for_tenant(
        self,
        tenant_id: str,
    ) -> list[str]:
        """
        Return skill names registered for a specific tenant.
        """

        return list(self._user_skills.get(tenant_id, {}).keys())

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

    def register_for_tenant(
        self,
        tenant_id: str,
        skill: SkillConfig,
    ) -> None:
        """
        Register a user-created skill under a tenant namespace.

        Tenant-scoped skills are layered on top of global skills during
        runtime so each tenant only sees their own custom skills plus the
        platform defaults.
        """

        if tenant_id not in self._user_skills:
            self._user_skills[tenant_id] = {}

        self._user_skills[tenant_id][skill.name] = skill

        logger.info(
            "Registered tenant skill: %s for tenant %s",
            skill.name,
            tenant_id,
        )

    def get_for_tenant(
        self,
        name: str,
        tenant_id: str | None,
    ) -> SkillConfig | None:
        """
        Resolve a skill by name, preferring tenant-specific definitions.

        Resolution order:
            1. Tenant-specific user skill (if ``tenant_id`` is provided).
            2. Global filesystem skill.
        """

        if tenant_id:
            tenant_skill = self._user_skills.get(tenant_id, {}).get(name)
            if tenant_skill is not None:
                return tenant_skill

        return self._skills.get(name)

    def get_all_for_tenant(
        self,
        tenant_id: str | None,
    ) -> list[SkillConfig]:
        """
        Return all global skills plus tenant-specific user skills.

        Tenant-specific skills with the same name as a global skill take
        precedence in the returned list.
        """

        merged = dict(self._skills)

        if tenant_id:
            merged.update(self._user_skills.get(tenant_id, {}))

        return list(merged.values())

    def get_active_for_tenant(
        self,
        tenant_id: str | None,
    ) -> list[SkillConfig]:
        """
        Return active skills for a tenant.
        """

        return [
            skill
            for skill in self.get_all_for_tenant(tenant_id)
            if skill.is_active
        ]

    def clear_tenant_skills(
        self,
        tenant_id: str,
    ) -> None:
        """
        Remove all user skills for a tenant.

        Useful during sync/testing or when refreshing tenant skills from
        the database.
        """

        if tenant_id in self._user_skills:
            del self._user_skills[tenant_id]
            logger.info(
                "Cleared tenant skills for %s",
                tenant_id,
            )
