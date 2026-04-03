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

export interface ConcessionsTheater {
  id: string;
  name: string;
  shortLabel: string;
}

export interface ConcessionsItemAvailability {
  theaterId: string;
  itemId: string;
  isAvailable: boolean;
  priceOverride: number | null;
  currentStock: number | null;
  lowStockThreshold: number | null;
}

export interface ConcessionsCatalogItem {
  id: string;
  name: string;
  description: string;
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
  availability: ConcessionsItemAvailability[];
}

export interface ConcessionsDataset {
  items: ConcessionsCatalogItem[];
  theaters: ConcessionsTheater[];
}

export const mockConcessionsTheaters: ConcessionsTheater[] = [
  { id: "orpheum", name: "The Orpheum", shortLabel: "ORP" },
  { id: "lyric", name: "The Lyric", shortLabel: "LYR" },
  { id: "bijou", name: "The Bijou", shortLabel: "BIJ" },
];

function createAvailability(
  itemId: string,
  values: Array<
    Pick<
      ConcessionsItemAvailability,
      "theaterId" | "isAvailable" | "priceOverride" | "currentStock" | "lowStockThreshold"
    >
  >
): ConcessionsItemAvailability[] {
  return values.map((value) => ({
    itemId,
    ...value,
  }));
}

export const mockConcessionsItems: ConcessionsCatalogItem[] = [
  {
    id: "item-popcorn-classic",
    name: "Classic Cinema Popcorn",
    description: "Buttery house popcorn served fresh at the counter.",
    itemType: "concession",
    category: "Popcorn",
    basePrice: 8.5,
    isActive: true,
    trackInventory: true,
    sku: "CON-POP-CLSC",
    fulfillmentType: "counter",
    prepRequired: true,
    ageRestricted: false,
    taxableCategory: "prepared-food",
    availability: createAvailability("item-popcorn-classic", [
      {
        theaterId: "orpheum",
        isAvailable: true,
        priceOverride: null,
        currentStock: 1240,
        lowStockThreshold: 120,
      },
      {
        theaterId: "lyric",
        isAvailable: true,
        priceOverride: 9,
        currentStock: 960,
        lowStockThreshold: 100,
      },
      {
        theaterId: "bijou",
        isAvailable: true,
        priceOverride: null,
        currentStock: 510,
        lowStockThreshold: 80,
      },
    ]),
  },
  {
    id: "item-ginger-ale",
    name: "Artisan Ginger Ale",
    description: "Bottled local soda with a bright ginger finish.",
    itemType: "concession",
    category: "Beverages",
    basePrice: 6.25,
    isActive: true,
    trackInventory: true,
    sku: "CON-BEV-GNGR",
    fulfillmentType: "counter",
    prepRequired: false,
    ageRestricted: false,
    taxableCategory: "beverage",
    availability: createAvailability("item-ginger-ale", [
      {
        theaterId: "orpheum",
        isAvailable: true,
        priceOverride: null,
        currentStock: 42,
        lowStockThreshold: 50,
      },
      {
        theaterId: "lyric",
        isAvailable: true,
        priceOverride: null,
        currentStock: 87,
        lowStockThreshold: 40,
      },
      {
        theaterId: "bijou",
        isAvailable: false,
        priceOverride: null,
        currentStock: null,
        lowStockThreshold: null,
      },
    ]),
  },
  {
    id: "item-truffles",
    name: "Local Cocoa Truffles",
    description: "Gift-box style chocolate bites from a nearby chocolatier.",
    itemType: "concession",
    category: "Candy",
    basePrice: 12,
    isActive: true,
    trackInventory: false,
    sku: "CON-CND-TRUF",
    fulfillmentType: "counter",
    prepRequired: false,
    ageRestricted: false,
    taxableCategory: "retail-food",
    availability: createAvailability("item-truffles", [
      {
        theaterId: "orpheum",
        isAvailable: false,
        priceOverride: null,
        currentStock: null,
        lowStockThreshold: null,
      },
      {
        theaterId: "lyric",
        isAvailable: true,
        priceOverride: 11.5,
        currentStock: 180,
        lowStockThreshold: 30,
      },
      {
        theaterId: "bijou",
        isAvailable: true,
        priceOverride: null,
        currentStock: 60,
        lowStockThreshold: 20,
      },
    ]),
  },
  {
    id: "item-soft-pretzel",
    name: "Jumbo Soft Pretzel",
    description: "Warm pretzel with sea salt and optional cheese cup.",
    itemType: "meal",
    category: "Hot Snacks",
    basePrice: 9,
    isActive: true,
    trackInventory: true,
    sku: "MEAL-PRTZ-JMB",
    fulfillmentType: "kitchen",
    prepRequired: true,
    ageRestricted: false,
    taxableCategory: "prepared-food",
    availability: createAvailability("item-soft-pretzel", [
      {
        theaterId: "orpheum",
        isAvailable: true,
        priceOverride: null,
        currentStock: 65,
        lowStockThreshold: 25,
      },
      {
        theaterId: "lyric",
        isAvailable: true,
        priceOverride: 9.5,
        currentStock: 15,
        lowStockThreshold: 20,
      },
      {
        theaterId: "bijou",
        isAvailable: false,
        priceOverride: null,
        currentStock: null,
        lowStockThreshold: null,
      },
    ]),
  },
  {
    id: "item-house-red",
    name: "House Red Pour",
    description: "A simple red wine pour staged for future evening service.",
    itemType: "alcohol",
    category: "Wine",
    basePrice: 11,
    isActive: false,
    trackInventory: true,
    sku: "ALC-WIN-RED",
    fulfillmentType: "bar",
    prepRequired: false,
    ageRestricted: true,
    taxableCategory: "alcohol",
    availability: createAvailability("item-house-red", [
      {
        theaterId: "orpheum",
        isAvailable: false,
        priceOverride: null,
        currentStock: 0,
        lowStockThreshold: 12,
      },
      {
        theaterId: "lyric",
        isAvailable: false,
        priceOverride: null,
        currentStock: 0,
        lowStockThreshold: 12,
      },
      {
        theaterId: "bijou",
        isAvailable: false,
        priceOverride: null,
        currentStock: 0,
        lowStockThreshold: 12,
      },
    ]),
  },
  {
    id: "item-date-night-combo",
    name: "Date Night Combo",
    description: "Two popcorns, two drinks, and one candy bundle.",
    itemType: "combo",
    category: "Combos",
    basePrice: 24,
    isActive: true,
    trackInventory: false,
    sku: "COMBO-DATE-NT",
    fulfillmentType: "counter",
    prepRequired: true,
    ageRestricted: false,
    taxableCategory: "combo",
    availability: createAvailability("item-date-night-combo", [
      {
        theaterId: "orpheum",
        isAvailable: true,
        priceOverride: null,
        currentStock: null,
        lowStockThreshold: null,
      },
      {
        theaterId: "lyric",
        isAvailable: true,
        priceOverride: 22,
        currentStock: null,
        lowStockThreshold: null,
      },
      {
        theaterId: "bijou",
        isAvailable: true,
        priceOverride: null,
        currentStock: null,
        lowStockThreshold: null,
      },
    ]),
  },
];

export function getMockConcessionsDataset(): ConcessionsDataset {
  return {
    items: mockConcessionsItems,
    theaters: mockConcessionsTheaters,
  };
}
