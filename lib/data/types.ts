export interface Movie {
  slug: string;
  title: string;
  tagline: string;
  rating: string;
  runtime: string;
  genre: string;
  status: "now-playing" | "coming-soon";
  director: string;
  cast: string[];
  synopsis: string;
  production: string;
  score: string;
  cinematography: string;
  backdrop: string;
  poster: string;
}

export interface Showtime {
  movieSlug: string;
  theaterId: string;
  badge: string | null;
  times: string[];
  price: string;
}

export interface TheaterSpec {
  label: string;
  value: string;
}

export interface ConcessionItem {
  name: string;
  price: string;
  note: string;
}

export interface Theater {
  id: string;
  name: string;
  district: string;
  established: number;
  address: string;
  heroImage: string;
  descriptionParagraphs: string[];
  specs: TheaterSpec[];
  concessions: ConcessionItem[];
  memberBenefits: string[];
  memberBlurb: string;
}

/** Joined shape used by the showtimes UI */
export interface TheaterWithFilms {
  id: string;
  name: string;
  district: string;
  films: {
    slug: string;
    title: string;
    rating: string;
    runtime: string;
    synopsis: string;
    poster: string;
    badge: string | null;
    times: string[];
    price: string;
  }[];
}

/** Joined shape used by the movie detail page */
export interface MovieWithShowtimes extends Movie {
  showtimes: {
    theaterId: string;
    theaterName: string;
    badge: string | null;
    times: string[];
    price: string;
  }[];
}

/** Joined shape used by a theater detail page */
export interface TheaterWithShowtimes extends Theater {
  currentFilms: {
    slug: string;
    title: string;
    rating: string;
    runtime: string;
    synopsis: string;
    poster: string;
    badge: string | null;
    times: string[];
    price: string;
    isNew: boolean;
  }[];
}
