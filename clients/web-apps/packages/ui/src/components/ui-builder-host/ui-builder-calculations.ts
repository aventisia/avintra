import { useCallback, useState } from "react";

import { type UiBuilderQueryResultEvent } from "./ui-builder-host.types";

/** One explained figure: what it is called on the page and how it is computed. */
export type UiBuilderCalculationItem = {
  label: string;
  formula: string;
};

/** The explanation of one named query of one data connection. */
export type UiBuilderCalculationSection = {
  id: string;
  connectionKey: string;
  queueName: string;
  title: string;
  description: string;
  metrics: UiBuilderCalculationItem[];
  derived: UiBuilderCalculationItem[];
};

type RawRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is RawRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asText = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const humanize = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());

const toDerivedItems = (value: unknown): UiBuilderCalculationItem[] =>
  (Array.isArray(value) ? value : []).flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const label = asText(entry.label);
    const formula = asText(entry.formula);
    return label && formula ? [{ label, formula }] : [];
  });

/**
 * Builds the calculation explanations for one query: backend formulas for every metric, labelled
 * with the spec's `title`/`label` hints, plus any `derived` formulas the page declared.
 */
export const toUiBuilderCalculationSections = ({
  connection,
  spec,
  result,
}: UiBuilderQueryResultEvent): UiBuilderCalculationSection[] => {
  const specQueries = isRecord(spec.queries) ? spec.queries : {};
  const resultQueries = isRecord(result) && isRecord(result.queries) ? result.queries : {};
  const sharedDerived = toDerivedItems(spec.derived);

  return Object.entries(resultQueries).flatMap(([name, resultSet], index) => {
    if (!isRecord(resultSet)) return [];
    const querySpec = isRecord(specQueries[name]) ? specQueries[name] : {};
    const formulas = isRecord(resultSet.formulas) ? resultSet.formulas : {};
    const specMetrics = Array.isArray(querySpec.metrics) ? querySpec.metrics.filter(isRecord) : [];

    const metrics = Object.entries(formulas).flatMap(([metricName, formula]) => {
      const text = asText(formula);
      if (!text) return [];
      const metricSpec = specMetrics.find((metric) => metric.name === metricName);
      return [{ label: asText(metricSpec?.label) ?? humanize(metricName), formula: text }];
    });
    const derived = [...toDerivedItems(querySpec.derived), ...(index === 0 ? sharedDerived : [])];

    return [
      {
        id: `${connection.key}:${name}`,
        connectionKey: connection.key,
        queueName: connection.queueName,
        title: asText(querySpec.title) ?? humanize(name),
        description: asText(resultSet.description) ?? "",
        metrics,
        derived,
      },
    ];
  });
};

/** Collects the latest calculation explanations reported by a host frame. */
export const useUiBuilderCalculations = () => {
  const [sections, setSections] = useState<UiBuilderCalculationSection[]>([]);

  const record = useCallback((event: UiBuilderQueryResultEvent) => {
    const incoming = toUiBuilderCalculationSections(event);
    if (incoming.length === 0) return;
    setSections((previous) => {
      const byId = new Map(previous.map((section) => [section.id, section]));
      for (const section of incoming) byId.set(section.id, section);
      return [...byId.values()];
    });
  }, []);

  const reset = useCallback(() => setSections([]), []);

  return { sections, record, reset };
};
