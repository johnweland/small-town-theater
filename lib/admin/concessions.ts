import type { Schema } from "@/amplify/data/resource";
import { CONCESSION_ITEM_PLACEHOLDER_IMAGE } from "@/lib/concessions";

export const catalogItemTypes = [
  "concession",
  "meal",
  "alcohol",
  "combo",
  "merch",
] as const;

export const fulfillmentTypes = ["counter", "kitchen", "bar"] as const;

export type CatalogItemType = (typeof catalogItemTypes)[number];
export type FulfillmentType = (typeof fulfillmentTypes)[number];

export type VenueItemRecord = Schema["VenueItem"]["type"];
export type VenueItemAvailabilityRecord = Schema["VenueItemAvailability"]["type"];
export type TheaterRecord = Schema["Theater"]["type"];
export type VenueItemVariationRecord = NonNullable<
  NonNullable<VenueItemRecord["variations"]>[number]
>;
type ConcessionsTheaterSource = Pick<TheaterRecord, "id" | "name">;

export interface ConcessionsTheater {
  id: string;
  name: string;
  shortLabel: string;
}

export interface ConcessionsItemAvailability {
  id?: string;
  theaterId: string;
  itemId: string;
  isAvailable: boolean;
  priceOverride: number | null;
  currentStock: number | null;
  lowStockThreshold: number | null;
  updatedAt?: string | null;
}

export interface ConcessionsItemVariation {
  id: string;
  name: string;
  description: string;
  priceDelta: number | null;
  sortOrder: number;
}

export interface ConcessionsCatalogItem {
  id: string;
  name: string;
  description: string;
  image: string;
  itemType: CatalogItemType;
  category: string;
  basePrice: number;
  isActive: boolean;
  trackInventory: boolean;
  sku: string;
  fulfillmentType: FulfillmentType;
  prepRequired: boolean;
  ageRestricted: boolean;
  taxableCategory: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  variations: ConcessionsItemVariation[];
  availability: ConcessionsItemAvailability[];
}

export interface ConcessionsDataset {
  items: ConcessionsCatalogItem[];
  theaters: ConcessionsTheater[];
}

export interface SaveVenueItemPayload {
  item: Omit<ConcessionsCatalogItem, "availability">;
  availability: ConcessionsItemAvailability[];
}

function toShortLabel(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 3)
    .map((segment) => segment[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
}

export function toConcessionsTheaters(
  theaters: ConcessionsTheaterSource[]
): ConcessionsTheater[] {
  return theaters.map((theater) => ({
    id: theater.id,
    name: theater.name,
    shortLabel: toShortLabel(theater.name),
  }));
}

function toAvailabilityMap(
  availability: VenueItemAvailabilityRecord[]
) {
  return availability.reduce<Record<string, VenueItemAvailabilityRecord[]>>(
    (map, record) => {
      if (!map[record.itemId]) {
        map[record.itemId] = [];
      }

      map[record.itemId].push(record);
      return map;
    },
    {}
  );
}

function toConcessionsVariation(
  variation: VenueItemVariationRecord
): ConcessionsItemVariation {
  return {
    id: variation.id,
    name: variation.name,
    description: variation.description ?? "",
    priceDelta: variation.priceDelta ?? null,
    sortOrder: variation.sortOrder,
  };
}

function createEmptyAvailability(
  itemId: string,
  theaterId: string
): ConcessionsItemAvailability {
  return {
    theaterId,
    itemId,
    isAvailable: false,
    priceOverride: null,
    currentStock: null,
    lowStockThreshold: null,
    updatedAt: null,
  };
}

function toConcessionsAvailability(
  itemId: string,
  theaterId: string,
  record?: VenueItemAvailabilityRecord
): ConcessionsItemAvailability {
  if (!record) {
    return createEmptyAvailability(itemId, theaterId);
  }

  return {
    id: record.id,
    theaterId: record.theaterId,
    itemId: record.itemId,
    isAvailable: record.isAvailable,
    priceOverride: record.priceOverride ?? null,
    currentStock: record.currentStock ?? null,
    lowStockThreshold: record.lowStockThreshold ?? null,
    updatedAt: record.updatedAt ?? null,
  };
}

export function buildConcessionsItems(params: {
  items: VenueItemRecord[];
  availability: VenueItemAvailabilityRecord[];
  theaters: ConcessionsTheater[];
}): ConcessionsCatalogItem[] {
  const availabilityByItem = toAvailabilityMap(params.availability);

  return params.items.map((item) => {
    const availability = availabilityByItem[item.id] ?? [];

    return {
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      image: item.image?.trim() || CONCESSION_ITEM_PLACEHOLDER_IMAGE,
      itemType: item.itemType,
      category: item.category,
      basePrice: item.basePrice,
      isActive: item.isActive,
      trackInventory: item.trackInventory,
      sku: item.sku,
      fulfillmentType: item.fulfillmentType,
      prepRequired: item.prepRequired,
      ageRestricted: item.ageRestricted,
      taxableCategory: item.taxableCategory,
      createdAt: item.createdAt ?? null,
      updatedAt: item.updatedAt ?? null,
      variations:
        item.variations
          ?.filter((variation): variation is VenueItemVariationRecord => Boolean(variation))
          .map(toConcessionsVariation)
          .sort((left, right) => left.sortOrder - right.sortOrder) ?? [],
      availability: params.theaters.map((theater) =>
        toConcessionsAvailability(
          item.id,
          theater.id,
          availability.find((record) => record.theaterId === theater.id)
        )
      ),
    };
  });
}

export function buildConcessionsDataset(params: {
  items: VenueItemRecord[];
  availability: VenueItemAvailabilityRecord[];
  theaters: ConcessionsTheaterSource[];
}): ConcessionsDataset {
  const concessionsTheaters = toConcessionsTheaters(params.theaters);

  return {
    theaters: concessionsTheaters,
    items: buildConcessionsItems({
      items: params.items,
      availability: params.availability,
      theaters: concessionsTheaters,
    }),
  };
}

export function toVenueItemCreateInput(
  item: Omit<ConcessionsCatalogItem, "availability">
): Schema["VenueItem"]["createType"] {
  return {
    name: item.name,
    description: item.description || null,
    image: item.image || null,
    itemType: item.itemType,
    category: item.category,
    basePrice: item.basePrice,
    isActive: item.isActive,
    trackInventory: item.trackInventory,
    sku: item.sku,
    fulfillmentType: item.fulfillmentType,
    prepRequired: item.prepRequired,
    ageRestricted: item.ageRestricted,
    taxableCategory: item.taxableCategory,
    variations: item.variations.length
      ? item.variations.map((variation) => ({
          id: variation.id,
          name: variation.name,
          description: variation.description || null,
          priceDelta: variation.priceDelta,
          sortOrder: variation.sortOrder,
        }))
      : null,
  };
}

export function toVenueItemUpdateInput(
  item: Omit<ConcessionsCatalogItem, "availability">
): Schema["VenueItem"]["updateType"] {
  return {
    id: item.id,
    name: item.name,
    description: item.description || null,
    image: item.image || null,
    itemType: item.itemType,
    category: item.category,
    basePrice: item.basePrice,
    isActive: item.isActive,
    trackInventory: item.trackInventory,
    sku: item.sku,
    fulfillmentType: item.fulfillmentType,
    prepRequired: item.prepRequired,
    ageRestricted: item.ageRestricted,
    taxableCategory: item.taxableCategory,
    variations: item.variations.length
      ? item.variations.map((variation) => ({
          id: variation.id,
          name: variation.name,
          description: variation.description || null,
          priceDelta: variation.priceDelta,
          sortOrder: variation.sortOrder,
        }))
      : null,
  };
}

export function shouldPersistAvailabilityRow(
  row: ConcessionsItemAvailability
) {
  return (
    row.isAvailable ||
    row.priceOverride != null ||
    row.currentStock != null ||
    row.lowStockThreshold != null
  );
}

export function toVenueItemAvailabilityCreateInput(
  row: ConcessionsItemAvailability
): Schema["VenueItemAvailability"]["createType"] {
  return {
    theaterId: row.theaterId,
    itemId: row.itemId,
    isAvailable: row.isAvailable,
    priceOverride: row.priceOverride,
    currentStock: row.currentStock,
    lowStockThreshold: row.lowStockThreshold,
  };
}

export function toVenueItemAvailabilityUpdateInput(
  row: ConcessionsItemAvailability
): Schema["VenueItemAvailability"]["updateType"] {
  return {
    id: row.id!,
    theaterId: row.theaterId,
    itemId: row.itemId,
    isAvailable: row.isAvailable,
    priceOverride: row.priceOverride,
    currentStock: row.currentStock,
    lowStockThreshold: row.lowStockThreshold,
  };
}
