import type { Showtime } from "./types";

export const showtimes: Showtime[] = [
  // Jackson Theater
  {
    movieSlug: "the-last-midnight",
    theaterId: "jackson",
    badge: null,
    times: ["2:20 PM", "5:45 PM", "8:30 PM", "10:15 PM"],
    price: "$14.50",
  },
  {
    movieSlug: "echoes-of-gold",
    theaterId: "jackson",
    badge: null,
    times: ["1:00 PM", "3:30 PM", "6:15 PM"],
    price: "$14.50",
  },
  // Sherburn Theater
  {
    movieSlug: "starlight-express",
    theaterId: "sherburn",
    badge: "70mm Special",
    times: ["11:00 AM", "1:45 PM", "4:30 PM"],
    price: "$12.00",
  },
  {
    movieSlug: "midnight-over-main",
    theaterId: "sherburn",
    badge: "70mm Projection",
    times: ["6:00 PM", "9:45 PM"],
    price: "$18.00",
  },
  // Midnight Over Main also plays at Jackson
  {
    movieSlug: "midnight-over-main",
    theaterId: "jackson",
    badge: null,
    times: ["7:30 PM", "10:15 PM"],
    price: "$14.50",
  },
  // The Alchemist's Daughter at Sherburn
  {
    movieSlug: "the-alchemists-daughter",
    theaterId: "sherburn",
    badge: "70mm Presentation",
    times: ["6:00 PM", "9:45 PM"],
    price: "$18.00",
  },
  // Static Horizon at Jackson
  {
    movieSlug: "static-horizon",
    theaterId: "jackson",
    badge: null,
    times: ["7:30 PM", "10:15 PM"],
    price: "$14.50",
  },
];
