"""Structured schemas for skill configuration and results."""

from typing import Any

from pydantic import BaseModel, Field


class SkillLicense(BaseModel):
    """
    License information for a skill package.

    Captures the license name, URL, and any custom terms so that skills
    can declare their reuse conditions alongside their code.
    """

    name: str = Field(
        default="",
        description="License identifier, e.g. MIT, Apache-2.0, Proprietary.",
    )
    url: str = Field(
        default="",
        description="URL to the full license text.",
    )
    terms: str = Field(
        default="",
        description="Short custom terms if no standard license applies.",
    )


class SkillReference(BaseModel):
    """
    External reference tied to a skill.

    Used to link skills to documentation, source repositories, or
    attribution pages.
    """

    title: str = Field(
        default="",
        description="Human-readable title of the reference.",
    )
    url: str = Field(
        default="",
        description="URL for the reference.",
    )
    type: str = Field(
        default="",
        description="Reference type, e.g. docs, source, author.",
    )


class SkillInput(BaseModel):
    """
    Input passed to a skill executor.

    ``payload`` can hold arbitrary keyword arguments that the skill
    expects, such as ``topic`` for an email writer or ``query`` for a
    SQL generator.
    """

    name: str = Field(
        description="Skill identifier to invoke.",
    )
    payload: dict[str, Any] = Field(
        default_factory=dict,
        description="Skill-specific arguments.",
    )
    context: dict[str, Any] = Field(
        default_factory=dict,
        description="Conversation context shared with the skill.",
    )


class SkillOutput(BaseModel):
    """
    Result produced by a skill executor.

    Skills can return raw text, structured data, or a list of messages.
    The dispatcher node inserts the result back into the graph state.
    """

    name: str = Field(
        description="Skill that produced the result.",
    )
    success: bool = Field(
        default=True,
        description="Whether the skill execution succeeded.",
    )
    output: Any = Field(
        default=None,
        description="Generated content or structured result.",
    )
    messages: list[dict[str, Any]] = Field(
        default_factory=list,
        description="Optional messages to append to the conversation.",
    )
    error: str | None = Field(
        default=None,
        description="Error message when success is False.",
    )


class SkillConfig(BaseModel):
    """
    Configuration used to register and resolve skills.

    ``is_active`` allows the registry to keep a skill definition while
    temporarily disabling it from routing decisions.

    ``license`` and ``references`` are surfaced from the skill's
    ``SKILL.md`` metadata so that runtime tooling can report provenance
    and compliance information.

    ``providers`` lists the LLM provider names the skill is compatible
    with. When empty, the skill is treated as provider-agnostic.
    """

    name: str = Field(
        description="Unique skill identifier.",
    )
    description: str = Field(
        description="Human-readable description shown to the LLM/router.",
    )
    is_active: bool = Field(
        default=True,
        description="Whether the skill is available for routing.",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Extra configuration consumed by the skill factory.",
    )
    license: SkillLicense = Field(
        default_factory=SkillLicense,
        description="License information declared by the skill.",
    )
    references: list[SkillReference] = Field(
        default_factory=list,
        description="External references and attribution for the skill.",
    )
    providers: list[str] = Field(
        default_factory=list,
        description="Compatible LLM provider names (empty means all).",
    )
