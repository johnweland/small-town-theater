"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CatalogItemType, ConcessionsTheater } from "@/lib/admin/concessions";

export interface ConcessionsFilterState {
  search: string;
  itemType: CatalogItemType | "all";
  category: string;
  theaterId: string;
  status: "all" | "active" | "inactive";
}

export function ConcessionsFilters({
  theaters,
  categories,
  value,
  onChange,
}: {
  theaters: ConcessionsTheater[];
  categories: string[];
  value: ConcessionsFilterState;
  onChange: (nextValue: ConcessionsFilterState) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
        <Input
          value={value.search}
          onChange={(event) =>
            onChange({
              ...value,
              search: event.target.value,
            })
          }
          placeholder="Search catalog, SKU, or description"
          className="pl-10"
        />
      </div>

      <Select
        value={value.itemType}
        onValueChange={(itemType: ConcessionsFilterState["itemType"]) =>
          onChange({
            ...value,
            itemType,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Item type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All item types</SelectItem>
            <SelectItem value="concession">Concession</SelectItem>
            <SelectItem value="meal">Meal</SelectItem>
            <SelectItem value="alcohol">Alcohol</SelectItem>
            <SelectItem value="combo">Combo</SelectItem>
            <SelectItem value="merch">Merch</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={value.category}
        onValueChange={(category) =>
          onChange({
            ...value,
            category,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={value.theaterId}
        onValueChange={(theaterId) =>
          onChange({
            ...value,
            theaterId,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Theater" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All theaters</SelectItem>
            {theaters.map((theater) => (
              <SelectItem key={theater.id} value={theater.id}>
                {theater.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={value.status}
        onValueChange={(status: ConcessionsFilterState["status"]) =>
          onChange({
            ...value,
            status,
          })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
