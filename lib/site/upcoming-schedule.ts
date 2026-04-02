import type { BookingDay, BookingTimeSlot, Movie } from "@/lib/data/types";

export type UpcomingFilterOption = {
  key: string;
  label: string;
  isoDate?: string;
};

export type DatedBookingTimeSlot = BookingTimeSlot & {
  isoDate: string;
  dateLabel: string;
};

export type SchedulableItem = {
  runStartsOn: string;
  runEndsOn: string;
  times: BookingTimeSlot[];
};

const ALL_UPCOMING_KEY = "all-upcoming";

export function getAllUpcomingFilter(): UpcomingFilterOption {
  return {
    key: ALL_UPCOMING_KEY,
    label: "All Upcoming",
  };
}

export function getTodayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

export function expandUpcomingSlots(
  item: SchedulableItem,
  todayIso = getTodayIsoDate()
): DatedBookingTimeSlot[] {
  const slots: DatedBookingTimeSlot[] = [];
  const startIso = item.runStartsOn > todayIso ? item.runStartsOn : todayIso;

  for (
    let cursor = isoToDate(startIso);
    cursor <= isoToDate(item.runEndsOn);
    cursor = addDays(cursor, 1)
  ) {
    const isoDate = toIsoDate(cursor);
    const weekday = weekdayFromIso(isoDate);

    for (const slot of item.times) {
      if (slot.day !== weekday) {
        continue;
      }

      slots.push({
        ...slot,
        isoDate,
        dateLabel: formatDateLabel(isoDate),
      });
    }
  }

  return slots.sort((left, right) => {
    const dateCompare = left.isoDate.localeCompare(right.isoDate);
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return left.time.localeCompare(right.time);
  });
}

export function buildUpcomingDateFilters(
  items: SchedulableItem[],
  todayIso = getTodayIsoDate()
): UpcomingFilterOption[] {
  const dates = Array.from(
    new Set(items.flatMap((item) => expandUpcomingSlots(item, todayIso).map((slot) => slot.isoDate)))
  ).sort((left, right) => left.localeCompare(right));

  return [
    getAllUpcomingFilter(),
    ...dates.map((isoDate) => ({
      key: isoDate,
      label: formatDateLabel(isoDate),
      isoDate,
    })),
  ];
}

export function getDefaultUpcomingFilterKey(
  items: SchedulableItem[],
  todayIso = getTodayIsoDate()
) {
  return buildUpcomingDateFilters(items, todayIso)[1]?.key ?? ALL_UPCOMING_KEY;
}

export function filterUpcomingItems<T extends SchedulableItem>(
  items: T[],
  filterKey: string,
  todayIso = getTodayIsoDate()
): Array<Omit<T, "times"> & { times: DatedBookingTimeSlot[] }> {
  return items
    .map((item) => {
      const expanded = expandUpcomingSlots(item, todayIso);
      const times =
        filterKey === ALL_UPCOMING_KEY
          ? expanded
          : expanded.filter((slot) => slot.isoDate === filterKey);

      return {
        ...item,
        times,
      };
    })
    .filter((item) => item.times.length > 0);
}

export function groupUpcomingItemsByDate<T extends SchedulableItem>(
  items: T[],
  todayIso = getTodayIsoDate()
) {
  const filters = buildUpcomingDateFilters(items, todayIso).filter(
    (filter) => filter.key !== ALL_UPCOMING_KEY
  );

  return filters.map((filter) => ({
    ...filter,
    items: filterUpcomingItems(items, filter.key, todayIso),
  }));
}

export function getUnscheduledComingSoonMovies(
  comingSoonMovies: Movie[],
  scheduledItems: Array<{ slug: string }>,
  todayIso = getTodayIsoDate()
) {
  const scheduledMovieSlugs = new Set(
    scheduledItems
      .filter((item) => {
        if (!("runStartsOn" in item) || !("runEndsOn" in item) || !("times" in item)) {
          return true;
        }

        return expandUpcomingSlots(
          item as SchedulableItem,
          todayIso
        ).length > 0;
      })
      .map((item) => item.slug)
  );

  return comingSoonMovies.filter((movie) => !scheduledMovieSlugs.has(movie.slug));
}

function weekdayFromIso(isoDate: string): BookingDay {
  const date = isoToDate(isoDate);
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const;

  return dayNames[date.getUTCDay()];
}

function formatDateLabel(isoDate: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).formatToParts(isoToDate(isoDate));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.weekday} ${values.month} ${values.day}`;
}

function isoToDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`);
}

function toIsoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
