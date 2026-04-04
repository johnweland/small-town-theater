import type {
  Booking as SharedBooking,
  BookingShowtime as SharedBookingShowtime,
  Screen as SharedScreen,
  ScreenStatus,
  Theater as SharedTheater,
  TheaterStatus,
} from "@/lib/data";

export type AdminStatus =
  | TheaterStatus
  | ScreenStatus
  | "draft"
  | "published"
  | "archived"
  | "now-playing"
  | "coming-soon";

export interface AdminTheater extends SharedTheater {
  heroImagePreview?: string;
}

export type AdminScreen = SharedScreen;

export type RecurringShowtime = SharedBookingShowtime;

export interface AdminMovie {
  id: string;
  slug: string;
  title: string;
  year: number;
  runtimeMinutes: number;
  rating: string;
  genres: string[];
  status: "now-playing" | "coming-soon" | "draft" | "archived" | null;
  tagline: string;
  overview: string;
  poster: string;
  backdrop: string;
  castHighlights: string[];
  trailerLabel: string;
}

export type AdminBooking = SharedBooking;

export interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  theaterId: string;
  image: string;
  startsAt: string;
  endsAt: string;
  startsAtLabel: string;
  endsAtLabel: string;
  status: "draft" | "published" | "archived";
  imagePreview?: string;
}

export interface AdminActivityItem {
  id: string;
  title: string;
  detail: string;
  occurredAt: string;
  kind: "theater" | "movie" | "booking" | "event";
}

export interface ImportCandidate {
  id: string;
  title: string;
  year: number;
  poster: string;
  backdrop: string;
  overview: string;
  genres: string[];
  castHighlights: string[];
  trailerLabel: string;
  trailerYouTubeId?: string;
  tmdbId?: number;
  tagline?: string;
  rating?: string;
  runtime?: string;
  status?: "now-playing" | "coming-soon" | "draft" | "archived" | null;
  director?: string;
  releaseDate?: string;
  releaseDateIso?: string;
  audienceScore?: string;
  originalLanguage?: string;
  productionCompanies?: string[];
}
