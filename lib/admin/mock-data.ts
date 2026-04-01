import { bookings as siteBookings } from "@/lib/data/bookings";
import { movies as siteMovies } from "@/lib/data/movies";
import { screens as siteScreens } from "@/lib/data/screens";
import { theaters as siteTheaters } from "@/lib/data/theaters";

import type {
  AdminActivityItem,
  AdminBooking,
  AdminEvent,
  AdminMovie,
  AdminScreen,
  AdminTheater,
  ImportCandidate,
} from "./types";

const [jacksonTheater, sherburnTheater] = siteTheaters;
const [
  superMarioBros,
  superMarioGalaxy,
  theMartian,
  projectHailMary,
  hackers,
  predatorBadlands,
] = siteMovies;

export const adminTheaters: AdminTheater[] = [
  jacksonTheater,
  sherburnTheater,
];

export const adminScreens: AdminScreen[] = siteScreens;

export const adminBookings: AdminBooking[] = siteBookings;

export const adminMovies: AdminMovie[] = [
  {
    id: "movie-super-mario-bros",
    slug: superMarioBros.slug,
    title: superMarioBros.title,
    year: 2023,
    runtimeMinutes: 93,
    rating: superMarioBros.rating,
    genres: ["Family", "Comedy", "Adventure"],
    status: "now-playing",
    tagline: superMarioBros.tagline,
    overview: superMarioBros.synopsis,
    poster: superMarioBros.poster,
    backdrop: superMarioBros.backdrop,
    castHighlights: superMarioBros.cast,
    trailerLabel: "Official trailer available",
  },
  {
    id: "movie-super-mario-galaxy",
    slug: superMarioGalaxy.slug,
    title: superMarioGalaxy.title,
    year: 2026,
    runtimeMinutes: 98,
    rating: superMarioGalaxy.rating,
    genres: ["Family", "Fantasy", "Adventure"],
    status: "coming-soon",
    tagline: superMarioGalaxy.tagline,
    overview: superMarioGalaxy.synopsis,
    poster: superMarioGalaxy.poster,
    backdrop: superMarioGalaxy.backdrop,
    castHighlights: superMarioGalaxy.cast,
    trailerLabel: "Teaser reel attached",
  },
  {
    id: "movie-the-martian",
    slug: theMartian.slug,
    title: theMartian.title,
    year: 2015,
    runtimeMinutes: 141,
    rating: theMartian.rating,
    genres: ["Science Fiction", "Drama", "Adventure"],
    status: "draft",
    tagline: theMartian.tagline,
    overview: theMartian.synopsis,
    poster: theMartian.poster,
    backdrop: theMartian.backdrop,
    castHighlights: theMartian.cast,
    trailerLabel: "Trailer placeholder",
  },
  {
    id: "movie-project-hail-mary",
    slug: projectHailMary.slug,
    title: projectHailMary.title,
    year: 2026,
    runtimeMinutes: 157,
    rating: projectHailMary.rating,
    genres: ["Science Fiction", "Adventure"],
    status: "now-playing",
    tagline: projectHailMary.tagline,
    overview: projectHailMary.synopsis,
    poster: projectHailMary.poster,
    backdrop: projectHailMary.backdrop,
    castHighlights: projectHailMary.cast,
    trailerLabel: "Official trailer available",
  },
  {
    id: "movie-hackers",
    slug: hackers.slug,
    title: hackers.title,
    year: 1995,
    runtimeMinutes: 105,
    rating: hackers.rating,
    genres: ["Action", "Crime", "Thriller"],
    status: "archived",
    tagline: hackers.tagline,
    overview: hackers.synopsis,
    poster: hackers.poster,
    backdrop: hackers.backdrop,
    castHighlights: hackers.cast,
    trailerLabel: "Restoration featurette",
  },
  {
    id: "movie-predator-badlands",
    slug: predatorBadlands.slug,
    title: predatorBadlands.title,
    year: 2025,
    runtimeMinutes: 107,
    rating: predatorBadlands.rating,
    genres: ["Action", "Science Fiction", "Adventure"],
    status: "coming-soon",
    tagline: predatorBadlands.tagline,
    overview: predatorBadlands.synopsis,
    poster: predatorBadlands.poster,
    backdrop: predatorBadlands.backdrop,
    castHighlights: predatorBadlands.cast,
    trailerLabel: "Trailer attached",
  },
];

export const adminEvents: AdminEvent[] = [
  {
    id: "event-annual-gala",
    title: "Preservation Society Spring Gala",
    slug: "spring-gala",
    summary: "A member-forward evening supporting restoration and youth film programs.",
    description:
      "Cocktail reception, silent auction, and a restored-classic screening with live pre-show music in the Jackson lobby.",
    theaterId: "jackson",
    image: jacksonTheater.heroImage,
    startsAt: "2026-04-25T18:30:00",
    endsAt: "2026-04-25T22:00:00",
    status: "published",
  },
  {
    id: "event-courtyard-noir",
    title: "Courtyard Noir Double Feature",
    slug: "courtyard-noir-double-feature",
    summary: "Outdoor projection night at Sherburn with coffee bar service and local jazz.",
    description:
      "Open-air double feature in the courtyard with blankets, lantern lighting, and a noir vinyl set between films.",
    theaterId: "sherburn",
    image: sherburnTheater.heroImage,
    startsAt: "2026-05-08T19:00:00",
    endsAt: "2026-05-08T23:30:00",
    status: "draft",
  },
];

export const adminRecentActivity: AdminActivityItem[] = [
  {
    id: "activity-1",
    title: "Updated booking window",
    detail: "The Last Midnight extended one extra week in Jackson.",
    occurredAt: "2 hours ago",
    kind: "booking",
  },
  {
    id: "activity-2",
    title: "Imported movie metadata",
    detail: "Starlight Express artwork and synopsis approved for review.",
    occurredAt: "Yesterday",
    kind: "movie",
  },
  {
    id: "activity-3",
    title: "Event draft prepared",
    detail: "Courtyard Noir Double Feature scheduled for internal approval.",
    occurredAt: "2 days ago",
    kind: "event",
  },
];

export const importCandidates: ImportCandidate[] = [
  {
    id: "import-ghost-light",
    title: "Ghost Light on River Street",
    year: 2026,
    poster: superMarioGalaxy.poster,
    backdrop: superMarioGalaxy.backdrop,
    overview:
      "After a theater nearly closes, a weary projectionist discovers a missing reel that may restore both the house and the town around it.",
    genres: ["Drama", "Mystery"],
    castHighlights: ["Mae Holloway", "Jordan Pike", "Lucia Vale"],
    trailerLabel: "Trailer placeholder",
  },
  {
    id: "import-autumn-ticket",
    title: "The Autumn Ticket",
    year: 2025,
    poster: projectHailMary.poster,
    backdrop: projectHailMary.backdrop,
    overview:
      "A bittersweet romance unfolds across one final season at a nearly forgotten main-street picture house.",
    genres: ["Romance", "Drama"],
    castHighlights: ["Naomi West", "Caleb Hart", "Fiona Reeves"],
    trailerLabel: "Preview clip available",
  },
  {
    id: "import-lantern-club",
    title: "Lantern Club",
    year: 2024,
    poster: superMarioBros.poster,
    backdrop: superMarioBros.backdrop,
    overview:
      "A spirited ensemble comedy about volunteers who band together to save a beloved local cinema from demolition.",
    genres: ["Comedy", "Community"],
    castHighlights: ["Mina Brooks", "Evan Dale", "Ruth Flores"],
    trailerLabel: "No trailer linked yet",
  },
];
