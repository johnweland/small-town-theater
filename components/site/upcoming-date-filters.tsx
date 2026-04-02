"use client";

import type { UpcomingFilterOption } from "@/lib/site/upcoming-schedule";

export function UpcomingDateFilters({
  filters,
  selectedKey,
  onSelect,
}: {
  filters: UpcomingFilterOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          onClick={() => onSelect(filter.key)}
          className={
            selectedKey === filter.key
              ? "bg-[#ffbf00] px-6 py-3 font-sans text-sm font-semibold text-[#402d00]"
              : "bg-[#2a2a2a] px-6 py-3 font-sans text-sm font-semibold text-[#9c8f78] transition-colors hover:text-[#e5e2e1]"
          }
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
