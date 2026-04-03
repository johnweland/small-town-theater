"use client";

import { MoreHorizontal, PencilLine, PlusSquare, Power } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminDataTable } from "@/components/admin/data-table";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { ConcessionItemImage } from "@/components/shared/concession-item-image";
import type {
  ConcessionsCatalogItem,
  ConcessionsTheater,
} from "@/lib/admin/concessions";

function titleCase(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getAvailabilitySummary(
  item: ConcessionsCatalogItem,
  theaters: ConcessionsTheater[]
) {
  const availableCount = item.availability.filter((entry) => entry.isAvailable).length;
  return `${availableCount} of ${theaters.length} theaters`;
}

export function ConcessionsTable({
  items,
  theaters,
  onEdit,
  onDuplicate,
  onToggleActive,
}: {
  items: ConcessionsCatalogItem[];
  theaters: ConcessionsTheater[];
  onEdit: (item: ConcessionsCatalogItem) => void;
  onDuplicate: (item: ConcessionsCatalogItem) => void;
  onToggleActive: (item: ConcessionsCatalogItem) => void;
}) {
  return (
    <AdminDataTable tableClassName="min-w-[1120px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[32%] min-w-[280px]">Item Name</TableHead>
          <TableHead className="whitespace-nowrap">Item Type</TableHead>
          <TableHead className="whitespace-nowrap">Category</TableHead>
          <TableHead className="whitespace-nowrap">Base Price</TableHead>
          <TableHead className="whitespace-nowrap">Fulfillment</TableHead>
          <TableHead className="whitespace-nowrap">Inventory</TableHead>
          <TableHead className="whitespace-nowrap">Availability</TableHead>
          <TableHead className="whitespace-nowrap">Status</TableHead>
          <TableHead className="w-16 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow
            key={item.id}
            className="cursor-pointer"
            onClick={() => onEdit(item)}
          >
            <TableCell className="py-5">
              <div className="flex min-w-0 items-start gap-4">
                <ConcessionItemImage
                  src={item.image}
                  alt={`${item.name} item`}
                  className="size-14 shrink-0 rounded-md"
                />
                <div className="min-w-0">
                  <p className="truncate font-serif text-[1.45rem] italic text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-1 truncate text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                      {item.sku}
                    </p>
                    {item.variations.length ? (
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {item.variations.length} variation
                        {item.variations.length === 1 ? "" : "s"}
                      </span>
                    ) : null}
                    {item.prepRequired ? (
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        Prep required
                      </span>
                    ) : null}
                    {item.ageRestricted ? (
                      <span className="text-[10px] uppercase tracking-[0.2em] text-secondary">
                        21+
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/10 px-2 py-0.5 text-primary"
              >
                {titleCase(item.itemType)}
              </Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap text-sm">{item.category}</TableCell>
            <TableCell className="whitespace-nowrap text-sm">
              {formatCurrency(item.basePrice)}
            </TableCell>
            <TableCell className="whitespace-nowrap text-sm">
              {titleCase(item.fulfillmentType)}
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <Badge
                variant={item.trackInventory ? "default" : "outline"}
                className="px-2 py-0.5"
              >
                {item.trackInventory ? "On" : "Off"}
              </Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
              {getAvailabilitySummary(item, theaters)}
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <AdminStatusBadge status={item.isActive ? "active" : "inactive"} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                  <Button variant="outline" size="icon-sm" aria-label={`Actions for ${item.name}`}>
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(item);
                    }}
                  >
                    <PencilLine data-icon="inline-start" />
                    Edit item
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      onDuplicate(item);
                    }}
                  >
                    <PlusSquare data-icon="inline-start" />
                    Duplicate item
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleActive(item);
                    }}
                  >
                    <Power data-icon="inline-start" />
                    {item.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </AdminDataTable>
  );
}
