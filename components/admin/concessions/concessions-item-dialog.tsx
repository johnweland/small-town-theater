"use client";

import { useMemo, useState } from "react";

import { Save, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TheaterAvailabilityEditor } from "./theater-availability-editor";
import type {
  CatalogItemType,
  ConcessionsCatalogItem,
  ConcessionsItemAvailability,
  ConcessionsTheater,
  FulfillmentType,
} from "@/lib/admin/concessions";

type FormValues = {
  name: string;
  description: string;
  itemType: CatalogItemType;
  category: string;
  basePrice: string;
  isActive: boolean;
  trackInventory: boolean;
  sku: string;
  fulfillmentType: FulfillmentType;
  prepRequired: boolean;
  ageRestricted: boolean;
  taxableCategory: string;
  availability: ConcessionsItemAvailability[];
};

type FormErrors = Partial<Record<keyof Omit<FormValues, "availability">, string>>;

function createEmptyItem(theaters: ConcessionsTheater[]): ConcessionsCatalogItem {
  return {
    id: "new-item",
    name: "",
    description: "",
    itemType: "concession",
    category: "",
    basePrice: 0,
    isActive: true,
    trackInventory: false,
    sku: "",
    fulfillmentType: "counter",
    prepRequired: false,
    ageRestricted: false,
    taxableCategory: "",
    availability: theaters.map((theater) => ({
      theaterId: theater.id,
      itemId: "new-item",
      isAvailable: false,
      priceOverride: null,
      currentStock: null,
      lowStockThreshold: null,
    })),
  };
}

function toFormValues(item: ConcessionsCatalogItem): FormValues {
  return {
    name: item.name,
    description: item.description,
    itemType: item.itemType,
    category: item.category,
    basePrice: String(item.basePrice),
    isActive: item.isActive,
    trackInventory: item.trackInventory,
    sku: item.sku,
    fulfillmentType: item.fulfillmentType,
    prepRequired: item.prepRequired,
    ageRestricted: item.ageRestricted,
    taxableCategory: item.taxableCategory,
    availability: item.availability,
  };
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }

  if (!values.category.trim()) {
    errors.category = "Category is required.";
  }

  if (!values.sku.trim()) {
    errors.sku = "SKU is required.";
  }

  if (!values.taxableCategory.trim()) {
    errors.taxableCategory = "Taxable category is required.";
  }

  if (values.basePrice === "" || Number(values.basePrice) < 0) {
    errors.basePrice = "Base price must be zero or greater.";
  }

  return errors;
}

function fieldClass(error?: string) {
  return error ? "border-destructive/40 focus-visible:ring-destructive/20" : undefined;
}

export function ConcessionsItemDialog({
  open,
  mode,
  item,
  theaters,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  mode: "create" | "edit";
  item: ConcessionsCatalogItem | null;
  theaters: ConcessionsTheater[];
  onOpenChange: (open: boolean) => void;
  onSave: (item: ConcessionsCatalogItem, mode: "create" | "edit") => void;
}) {
  const seedItem = useMemo(
    () => item ?? createEmptyItem(theaters),
    [item, theaters]
  );
  const [values, setValues] = useState<FormValues>(() => toFormValues(seedItem));
  const [errors, setErrors] = useState<FormErrors>({});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 h-screen max-w-3xl translate-x-0 translate-y-0 overflow-y-auto border-l border-border/30 p-0 sm:max-w-3xl">
        <div className="flex min-h-full flex-col bg-surface-container-low">
          <DialogHeader className="border-b border-border/20 px-6 py-5">
            <DialogTitle>
              {mode === "create" ? "Add catalog item" : values.name || "Edit catalog item"}
            </DialogTitle>
            <DialogDescription>
              Manage a shared catalog item now, with availability and inventory fields ready for future Amplify wiring.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-8 px-6 py-6">
            <section className="grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Item Name
                </span>
                <Input
                  value={values.name}
                  onChange={(event) => setValues({ ...values, name: event.target.value })}
                  className={fieldClass(errors.name)}
                  aria-invalid={Boolean(errors.name)}
                  placeholder="Classic Cinema Popcorn"
                />
                {errors.name ? (
                  <span className="text-xs text-destructive">{errors.name}</span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Description
                </span>
                <Textarea
                  value={values.description}
                  onChange={(event) =>
                    setValues({ ...values, description: event.target.value })
                  }
                  placeholder="Short catalog description for staff and future POS surfaces."
                  rows={4}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Item Type
                </span>
                <Select
                  value={values.itemType}
                  onValueChange={(itemType: CatalogItemType) =>
                    setValues({ ...values, itemType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="concession">Concession</SelectItem>
                      <SelectItem value="meal">Meal</SelectItem>
                      <SelectItem value="alcohol">Alcohol</SelectItem>
                      <SelectItem value="combo">Combo</SelectItem>
                      <SelectItem value="merch">Merch</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Category
                </span>
                <Input
                  value={values.category}
                  onChange={(event) => setValues({ ...values, category: event.target.value })}
                  className={fieldClass(errors.category)}
                  aria-invalid={Boolean(errors.category)}
                  placeholder="Popcorn"
                />
                {errors.category ? (
                  <span className="text-xs text-destructive">{errors.category}</span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Base Price
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.basePrice}
                  onChange={(event) => setValues({ ...values, basePrice: event.target.value })}
                  className={fieldClass(errors.basePrice)}
                  aria-invalid={Boolean(errors.basePrice)}
                  placeholder="0.00"
                />
                {errors.basePrice ? (
                  <span className="text-xs text-destructive">{errors.basePrice}</span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  SKU
                </span>
                <Input
                  value={values.sku}
                  onChange={(event) => setValues({ ...values, sku: event.target.value })}
                  className={fieldClass(errors.sku)}
                  aria-invalid={Boolean(errors.sku)}
                  placeholder="CON-POP-CLSC"
                />
                {errors.sku ? (
                  <span className="text-xs text-destructive">{errors.sku}</span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Fulfillment Type
                </span>
                <Select
                  value={values.fulfillmentType}
                  onValueChange={(fulfillmentType: FulfillmentType) =>
                    setValues({ ...values, fulfillmentType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="counter">Counter</SelectItem>
                      <SelectItem value="kitchen">Kitchen</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  Taxable Category
                </span>
                <Input
                  value={values.taxableCategory}
                  onChange={(event) =>
                    setValues({ ...values, taxableCategory: event.target.value })
                  }
                  className={fieldClass(errors.taxableCategory)}
                  aria-invalid={Boolean(errors.taxableCategory)}
                  placeholder="prepared-food"
                />
                {errors.taxableCategory ? (
                  <span className="text-xs text-destructive">
                    {errors.taxableCategory}
                  </span>
                ) : null}
              </label>
            </section>

            <section className="rounded-lg border border-border/20 bg-surface-container-high p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary" />
                <div>
                  <p className="font-sans text-sm font-semibold text-foreground">
                    Inventory readiness
                  </p>
                  <p className="text-xs leading-5 text-muted-foreground">
                    Track the switches now so we can connect live stock and replenishment later without changing the form contract.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  {
                    key: "isActive",
                    label: "Active in catalog",
                    checked: values.isActive,
                    onCheckedChange: (checked: boolean) =>
                      setValues({ ...values, isActive: checked }),
                  },
                  {
                    key: "trackInventory",
                    label: "Track inventory when enabled",
                    checked: values.trackInventory,
                    onCheckedChange: (checked: boolean) =>
                      setValues({ ...values, trackInventory: checked }),
                  },
                  {
                    key: "prepRequired",
                    label: "Prep required",
                    checked: values.prepRequired,
                    onCheckedChange: (checked: boolean) =>
                      setValues({ ...values, prepRequired: checked }),
                  },
                  {
                    key: "ageRestricted",
                    label: "Age restricted",
                    checked: values.ageRestricted,
                    onCheckedChange: (checked: boolean) =>
                      setValues({ ...values, ageRestricted: checked }),
                  },
                ].map((toggle) => (
                  <label
                    key={toggle.key}
                    className="flex items-center justify-between rounded-md bg-surface-container-highest px-4 py-3"
                  >
                    <span className="text-sm text-foreground">{toggle.label}</span>
                    <Switch
                      checked={toggle.checked}
                      onCheckedChange={toggle.onCheckedChange}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="font-serif text-2xl italic text-foreground">
                  Theater availability
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Enable or disable the item per theater and stage local pricing now. Stock fields are clearly optional and future-ready.
                </p>
              </div>
              <TheaterAvailabilityEditor
                theaters={theaters}
                availability={values.availability}
                onChange={(availability) => setValues({ ...values, availability })}
              />
            </section>

            <Separator className="bg-border/20" />

            <section className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4">
              {/* TODO: Replace local onSave handling with Amplify mutation calls and optimistic cache updates. */}
              <p className="font-sans text-sm font-semibold text-foreground">
                Backend handoff note
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This form currently saves into local typed state only. The field structure is intentionally aligned for later Amplify models and per-theater mutations.
              </p>
            </section>
          </div>

          <DialogFooter className="border-t border-border/20 px-6 py-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const nextErrors = validate(values);
                setErrors(nextErrors);

                if (Object.keys(nextErrors).length > 0) {
                  return;
                }

                onSave(
                  {
                    ...seedItem,
                    name: values.name.trim(),
                    description: values.description.trim(),
                    itemType: values.itemType,
                    category: values.category.trim(),
                    basePrice: Number(values.basePrice),
                    isActive: values.isActive,
                    trackInventory: values.trackInventory,
                    sku: values.sku.trim(),
                    fulfillmentType: values.fulfillmentType,
                    prepRequired: values.prepRequired,
                    ageRestricted: values.ageRestricted,
                    taxableCategory: values.taxableCategory.trim(),
                    availability: values.availability.map((entry) => ({
                      ...entry,
                      itemId: seedItem.id,
                    })),
                  },
                  mode
                );
              }}
            >
              <Save data-icon="inline-start" />
              {mode === "create" ? "Create Item" : "Save Changes"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
