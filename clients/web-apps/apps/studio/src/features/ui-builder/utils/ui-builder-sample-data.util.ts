import { type UiBuilderQueueSchemaField } from "../dtos/ui-builder-dto";

/** One generated work item payload, keyed by schema field name. */
export type UiBuilderSampleItem = Record<string, unknown>;

const FIRST_NAMES = [
  "Ava",
  "Liam",
  "Maya",
  "Noah",
  "Priya",
  "Ethan",
  "Sofia",
  "Arjun",
  "Chloe",
  "Mateo",
];
const LAST_NAMES = [
  "Patel",
  "Nguyen",
  "Garcia",
  "Kim",
  "Okafor",
  "Rossi",
  "Schmidt",
  "Khan",
  "Silva",
  "Brown",
];
const COMPANIES = [
  "Northwind",
  "Contoso",
  "Globex",
  "Initech",
  "Umbrella Health",
  "Stark Logistics",
  "Acme Corp",
  "Wayne Retail",
];
const CITIES = ["Austin", "London", "Pune", "Toronto", "Berlin", "Sydney", "Singapore", "Dublin"];
const CATEGORIES = ["Billing", "Onboarding", "Support", "Compliance", "Procurement", "Shipping"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATES = ["New", "Under review", "Awaiting info", "Approved", "Rejected"];
const TAGS = ["urgent", "vip", "follow-up", "renewal", "escalated", "new-customer"];
const SENTENCES = [
  "Customer reported a mismatch between the invoice and the purchase order.",
  "Request to update the shipping address before dispatch.",
  "Needs approval from the finance team before processing.",
  "Duplicate submission detected; please verify the reference.",
  "Documents attached; awaiting compliance verification.",
  "Follow up with the account owner about renewal terms.",
];

const pick = <T>(values: readonly T[], index: number) => values[index % values.length];

const nameOf = (field: UiBuilderQueueSchemaField) => field.name.toLowerCase();

const isoDate = (index: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 30 + index * 3);
  return date.toISOString().slice(0, 10);
};

const sampleString = (field: UiBuilderQueueSchemaField, index: number) => {
  const name = nameOf(field);
  const person = `${pick(FIRST_NAMES, index)} ${pick(LAST_NAMES, index * 3 + 1)}`;
  if (field.isUsedForUniqueIdentifier || /(^id$|ref|number|code|invoice|order)/.test(name)) {
    return `${field.name.slice(0, 3).toUpperCase()}-${1001 + index}`;
  }
  if (name.includes("email")) return `${person.toLowerCase().replace(" ", ".")}@example.com`;
  if (name.includes("phone")) return `+1 555 01${String(index).padStart(2, "0")}`;
  if (/(company|customer|vendor|supplier|account|org)/.test(name)) return pick(COMPANIES, index);
  if (/(first)/.test(name)) return pick(FIRST_NAMES, index);
  if (/(last|surname)/.test(name)) return pick(LAST_NAMES, index);
  if (/(name|owner|assignee|requester|contact)/.test(name)) return person;
  if (/(city|location|region)/.test(name)) return pick(CITIES, index);
  if (/(priority|severity)/.test(name)) return pick(PRIORITIES, index);
  if (/(status|state|stage)/.test(name)) return pick(STATES, index);
  if (/(category|type|department|team)/.test(name)) return pick(CATEGORIES, index);
  if (/(currency)/.test(name)) return pick(["USD", "EUR", "GBP", "INR"], index);
  if (/(description|note|comment|summary|reason|message|details)/.test(name)) {
    return pick(SENTENCES, index);
  }
  if (/(url|link)/.test(name)) return `https://example.com/items/${1001 + index}`;
  return `${field.label || field.name} ${index + 1}`;
};

const sampleInt = (field: UiBuilderQueueSchemaField, index: number) => {
  const name = nameOf(field);
  if (/(amount|total|price|cost|value|balance)/.test(name)) return 1250 + ((index * 7919) % 48000);
  if (/(qty|quantity|count|items)/.test(name)) return 1 + ((index * 3) % 12);
  if (/(age)/.test(name)) return 24 + ((index * 5) % 40);
  if (/(score|rating|percent)/.test(name)) return 50 + ((index * 13) % 50);
  if (field.isUsedForUniqueIdentifier || /(id|number)/.test(name)) return 100001 + index;
  return 1 + ((index * 17) % 100);
};

const sampleValue = (field: UiBuilderQueueSchemaField, index: number): unknown => {
  if (field.type === "int") return sampleInt(field, index);
  if (field.type === "Date") return isoDate(index);
  if (field.type === "Array") return [pick(TAGS, index), pick(TAGS, index + 2)];
  return sampleString(field, index);
};

/** Builds deterministic, realistic-looking sample items from a schema without a model. */
export const buildUiBuilderLocalSampleItems = (
  fields: UiBuilderQueueSchemaField[],
  count: number,
): UiBuilderSampleItem[] =>
  Array.from({ length: count }, (_, index) =>
    Object.fromEntries(fields.map((field) => [field.name, sampleValue(field, index)])),
  );

const coerceValue = (field: UiBuilderQueueSchemaField, value: unknown, index: number): unknown => {
  if (value === null || value === undefined || value === "") {
    return field.isRequired || field.isUsedForUniqueIdentifier ? sampleValue(field, index) : null;
  }
  if (field.type === "int") {
    const number =
      typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
    return Number.isFinite(number) ? Math.round(number) : sampleInt(field, index);
  }
  if (field.type === "Date") {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? isoDate(index) : date.toISOString().slice(0, 10);
  }
  if (field.type === "Array") {
    return Array.isArray(value)
      ? value.map((entry) => (typeof entry === "string" ? entry : JSON.stringify(entry)))
      : [String(value)];
  }
  return typeof value === "string" ? value : JSON.stringify(value);
};

/**
 * Coerces model-generated items onto the schema: keeps only schema fields, fixes types, fills
 * missing required values, and makes unique-reference combinations distinct.
 */
export const normalizeUiBuilderSampleItems = (
  fields: UiBuilderQueueSchemaField[],
  rawItems: unknown,
  count: number,
): UiBuilderSampleItem[] => {
  const source = Array.isArray(rawItems) ? rawItems : [];
  const uniqueFields = fields.filter((field) => field.isUsedForUniqueIdentifier);
  const seenKeys = new Set<string>();
  const items: UiBuilderSampleItem[] = [];

  for (let index = 0; index < count; index += 1) {
    const raw = source[index];
    const record =
      raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
    const item = Object.fromEntries(
      fields.map((field) => [
        field.name,
        raw === undefined
          ? sampleValue(field, index)
          : coerceValue(field, record[field.name], index),
      ]),
    );

    const uniqueKey = uniqueFields.map((field) => String(item[field.name])).join("|");
    if (uniqueFields.length > 0 && seenKeys.has(uniqueKey)) {
      for (const field of uniqueFields) item[field.name] = sampleValue(field, index + count);
    }
    seenKeys.add(uniqueFields.map((field) => String(item[field.name])).join("|"));
    items.push(item);
  }

  return items;
};
