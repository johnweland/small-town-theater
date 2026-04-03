"use client";

import { DollarSign } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type {
  ConcessionsItemAvailability,
  ConcessionsTheater,
} from "@/lib/admin/concessions";

const availabilityFieldLabelClassName =
  "min-h-8 font-sans text-[10px] font-semibold uppercase leading-[1.25] tracking-[0.18em] text-primary";

const availabilityInputClassName =
  "h-12 py-0 text-[15px] leading-none placeholder:text-[15px]";

function numberValue(value: number | null) {
  return value == null ? "" : String(value);
}

export function TheaterAvailabilityEditor({
  theaters,
  availability,
  onChange,
}: {
  theaters: ConcessionsTheater[];
  availability: ConcessionsItemAvailability[];
  onChange: (nextValue: ConcessionsItemAvailability[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {theaters.map((theater) => {
        const row = availability.find((entry) => entry.theaterId === theater.id);

        if (!row) {
          return null;
        }

        return (
          <div
            key={theater.id}
            className="rounded-lg border border-border/20 bg-surface-container-high p-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-sans text-sm font-semibold text-foreground">
                    {theater.name}
                  </p>
                  <Badge variant="outline" className="border-border/40 px-2 py-1 text-[10px]">
                    {theater.shortLabel}
                  </Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Control local sellability now and leave stock fields ready for future inventory wiring.
                </p>
              </div>

              <label className="flex items-center gap-3 self-start pt-0.5 text-sm">
                <span className="font-medium text-muted-foreground">Available</span>
                <Switch
                  checked={row.isAvailable}
                  onCheckedChange={(checked) =>
                    onChange(
                      availability.map((entry) =>
                        entry.theaterId === theater.id
                          ? { ...entry, isAvailable: checked }
                          : entry
                      )
                    )
                  }
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span className={availabilityFieldLabelClassName}>
                  Price Override
                </span>
                <div className="relative">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={numberValue(row.priceOverride)}
                    onChange={(event) =>
                      onChange(
                        availability.map((entry) =>
                          entry.theaterId === theater.id
                            ? {
                                ...entry,
                                priceOverride:
                                  event.target.value === ""
                                    ? null
                                    : Number(event.target.value),
                              }
                            : entry
                        )
                      )
                    }
                    placeholder="Use base price"
                    className={`pl-10 ${availabilityInputClassName}`}
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className={availabilityFieldLabelClassName}>
                  Future Stock
                </span>
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={numberValue(row.currentStock)}
                  onChange={(event) =>
                    onChange(
                      availability.map((entry) =>
                        entry.theaterId === theater.id
                          ? {
                              ...entry,
                              currentStock:
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value),
                            }
                          : entry
                      )
                    )
                  }
                  placeholder="Optional"
                  className={availabilityInputClassName}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={availabilityFieldLabelClassName}>
                  Future Low-Stock Threshold
                </span>
                <Input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={numberValue(row.lowStockThreshold)}
                  onChange={(event) =>
                    onChange(
                      availability.map((entry) =>
                        entry.theaterId === theater.id
                          ? {
                              ...entry,
                              lowStockThreshold:
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value),
                            }
                          : entry
                      )
                    )
                  }
                  placeholder="Optional"
                  className={availabilityInputClassName}
                />
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
