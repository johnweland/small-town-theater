"use client";

import { useMemo, useState } from "react";

import {
  AlertTriangle,
  CirclePlus,
  LoaderCircle,
  Package2,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSectionCard } from "@/components/admin/section-card";
import { ConcessionsFilters, type ConcessionsFilterState } from "./concessions-filters";
import { ConcessionsItemDialog } from "./concessions-item-dialog";
import { ConcessionsTable } from "./concessions-table";
import type {
  ConcessionsCatalogItem,
  ConcessionsDataset,
} from "@/lib/admin/concessions";
import { useConcessionsCatalog } from "./use-concessions-catalog";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getLowStockAlerts(
  items: ConcessionsCatalogItem[],
  theaters: ConcessionsDataset["theaters"]
) {
  return items.flatMap((item) =>
    item.availability.flatMap((entry) => {
      if (
        !entry.isAvailable ||
        entry.currentStock == null ||
        entry.lowStockThreshold == null ||
        entry.currentStock > entry.lowStockThreshold
      ) {
        return [];
      }

      const theater = theaters.find(({ id }) => id === entry.theaterId);
      return [
        {
          id: `${item.id}-${entry.theaterId}`,
          itemName: item.name,
          theaterName: theater?.name ?? entry.theaterId,
          currentStock: entry.currentStock,
          threshold: entry.lowStockThreshold,
        },
      ];
    })
  );
}

export function ConcessionsInventoryView({
  initialData,
  initialError = null,
}: {
  initialData: ConcessionsDataset;
  initialError?: string | null;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ConcessionsFilterState>({
    search: "",
    itemType: "all",
    category: "all",
    theaterId: "all",
    status: "all",
  });
  const {
    data,
    error,
    isLoading,
    isSaving,
    saveError,
    clearSaveError,
    saveItem,
    duplicateItem,
    toggleItemActive,
    refreshData,
  } = useConcessionsCatalog({
    initialData,
    initialError,
  });
  const { items, theaters } = data;

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).sort(),
    [items]
  );

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = filters.search.trim().toLowerCase();
      const matchesQuery =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesType =
        filters.itemType === "all" || item.itemType === filters.itemType;
      const matchesCategory =
        filters.category === "all" || item.category === filters.category;
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" ? item.isActive : !item.isActive);
      const matchesTheater =
        filters.theaterId === "all" ||
        item.availability.some(
          (entry) => entry.theaterId === filters.theaterId && entry.isAvailable
        );

      return matchesQuery && matchesType && matchesCategory && matchesStatus && matchesTheater;
    });
  }, [filters, items]);

  const lowStockAlerts = useMemo(
    () => getLowStockAlerts(items, theaters),
    [items, theaters]
  );

  const statCards = useMemo(() => {
    const activeItems = items.filter((item) => item.isActive).length;
    const inventoryReady = items.filter((item) => item.trackInventory).length;
    const theaterCount = new Set(
      items.flatMap((item) =>
        item.availability.filter((entry) => entry.isAvailable).map((entry) => entry.theaterId)
      )
    ).size;

    return [
      {
        label: "Total Items",
        value: String(items.length).padStart(2, "0"),
        hint: "unified catalog",
        icon: <Package2 className="text-primary" />,
      },
      {
        label: "Low Signals",
        value: String(lowStockAlerts.length).padStart(2, "0"),
        hint: "future-ready stock flags",
        icon: <AlertTriangle className="text-secondary" />,
      },
      {
        label: "Active Theaters",
        value: String(theaterCount).padStart(2, "0"),
        hint: "currently carrying items",
        icon: <Store className="text-primary" />,
      },
      {
        label: "Tracked Items",
        value: String(inventoryReady).padStart(2, "0"),
        hint: "ready for stock wiring",
        icon: <LoaderCircle className="text-primary" />,
      },
      {
        label: "Active Items",
        value: String(activeItems).padStart(2, "0"),
        hint: "selling now",
        icon: <CirclePlus className="text-primary" />,
      },
    ];
  }, [items, lowStockAlerts.length]);

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        eyebrow="Concessions"
        title="Concessions inventory"
        description="Catalog and availability management for theater concessions today, with meals, alcohol, and stock-aware workflows ready to grow into later."
        action={
          <Button
            onClick={() => {
              clearSaveError();
              setDialogMode("create");
              setSelectedItemId(null);
              setDialogOpen(true);
            }}
          >
            <CirclePlus data-icon="inline-start" />
            Add Item
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border/20 bg-surface-container-low px-6 py-5 shadow-lg shadow-black/20"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-3 font-serif text-4xl italic text-foreground">
                  {card.value}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-primary/70">
                  {card.hint}
                </p>
              </div>
              <div className="rounded-md bg-surface-container-high p-3">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <AdminSectionCard
        title="Catalog controls"
        description="Filter across item type, category, theater, and current catalog status while keeping future inventory metadata visible."
        action={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => void refreshData()}>
              Refresh
            </Button>
            <Button variant="outline" disabled>
              Bulk Update
            </Button>
          </div>
        }
      >
        <ConcessionsFilters
          theaters={theaters}
          categories={categories}
          value={filters}
          onChange={setFilters}
        />
      </AdminSectionCard>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.85fr)_280px]">
        <div className="flex flex-col gap-4">
          {error ? (
            <AdminSectionCard
              title="Amplify sync issue"
              description={error}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Deploy the updated Gen 2 schema if the new VenueItem models are not available yet, then refresh this page.
                </p>
                <Button variant="outline" onClick={() => void refreshData()}>
                  Retry
                </Button>
              </div>
            </AdminSectionCard>
          ) : null}

          {isLoading ? (
            <div className="rounded-lg border border-border/20 bg-surface-container-low p-4">
              <div className="grid gap-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          ) : filteredItems.length ? (
            <>
              <ConcessionsTable
                items={filteredItems}
                theaters={theaters}
                onEdit={(item) => {
                  clearSaveError();
                  setDialogMode("edit");
                  setSelectedItemId(item.id);
                  setDialogOpen(true);
                }}
                onDuplicate={(item) => {
                  void duplicateItem(item);
                }}
                onToggleActive={(item) => {
                  void toggleItemActive(item);
                }}
              />
              <div className="flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                <span>
                  Showing {filteredItems.length} of {items.length} items
                </span>
                <span>
                  Avg. base price{" "}
                  {formatCurrency(
                    filteredItems.reduce((sum, item) => sum + item.basePrice, 0) /
                      filteredItems.length
                  )}
                </span>
              </div>
            </>
          ) : (
            <AdminEmptyState
              title="No catalog items match these filters"
              description="Try broadening the search or add a new item to seed the concessions catalog for upcoming theater rollouts."
              action={
                <Button
                  onClick={() => {
                    clearSaveError();
                    setDialogMode("create");
                    setSelectedItemId(null);
                    setDialogOpen(true);
                  }}
                >
                  Add Item
                </Button>
              }
              icon={<Package2 />}
            />
          )}
        </div>

        <div className="flex flex-col gap-6">
          <AdminSectionCard
            title="Availability alerts"
            description="Stock values are mock data for now, but the UI is already shaping the future low-stock workflow."
          >
            {lowStockAlerts.length ? (
              <div className="flex flex-col gap-4">
                {lowStockAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-md border-l-2 border-secondary bg-surface-container-high p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-sans text-sm font-semibold text-foreground">
                        {alert.itemName}
                      </p>
                      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary">
                        {alert.theaterName}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Current stock is {alert.currentStock} against a threshold of {alert.threshold}.
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                No low-stock mock alerts right now.
              </p>
            )}
          </AdminSectionCard>
        </div>
      </div>

      <ConcessionsItemDialog
        key={`${dialogMode}-${selectedItemId ?? "new"}-${dialogOpen ? "open" : "closed"}`}
        open={dialogOpen}
        mode={dialogMode}
        item={selectedItem}
        theaters={theaters}
        isSaving={isSaving}
        saveError={saveError}
        onOpenChange={setDialogOpen}
        onSave={async (item, mode) => {
          await saveItem(item, mode);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
