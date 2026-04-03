"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  deleteManagedStorageObjectByUrl,
  deleteMovieInAmplify,
  getMovieFromAmplify,
  listBookingsFromAmplify,
  updateMovieInAmplify,
} from "@/lib/amplify/server";
import { getTmdbImportCandidate } from "@/lib/admin";
import { createAdminNoticeHref } from "@/lib/admin/notice";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getStringList(formData: FormData, key: string) {
  return getString(formData, key)
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toAmplifyDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function revalidateMoviePaths(movieId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/movies");
  revalidatePath("/admin/movies/new");
  revalidatePath("/showtimes");
  revalidatePath("/");

  if (movieId) {
    revalidatePath(`/admin/movies/${movieId}`);
  }
}

export async function updateMovieAction(formData: FormData) {
  const id = getString(formData, "id");
  const slug = getString(formData, "slug");
  const title = getString(formData, "title");
  const status = getString(formData, "status");
  const rating = getString(formData, "rating");
  const runtime = getString(formData, "runtime");
  const genre = getString(formData, "genre");
  const tagline = getString(formData, "tagline");
  const synopsis = getString(formData, "synopsis");
  const director = getString(formData, "director");
  const production = getString(formData, "production");
  const score = getString(formData, "score");
  const cinematography = getString(formData, "cinematography");
  const poster = getString(formData, "poster");
  const backdrop = getString(formData, "backdrop");
  const releaseDate = getString(formData, "releaseDate");
  const audienceScore = getString(formData, "audienceScore");
  const originalLanguage = getString(formData, "originalLanguage");
  const trailerYouTubeId = getString(formData, "trailerYouTubeId");
  const cast = getStringList(formData, "cast");
  const productionCompanies = getStringList(formData, "productionCompanies");

  if (!id || !slug || !title) {
    throw new Error("Movie id, slug, and title are required.");
  }

  if (
    status !== "draft" &&
    status !== "comingSoon" &&
    status !== "nowPlaying" &&
    status !== "archived"
  ) {
    throw new Error("Invalid movie status.");
  }

  const existingMovie = await getMovieFromAmplify(id);

  if (existingMovie.errors?.length) {
    throw new Error(
      `Unable to load the existing movie: ${existingMovie.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (!existingMovie.data) {
    throw new Error("The movie could not be found.");
  }

  const result = await updateMovieInAmplify({
    id,
    slug,
    title,
    status,
    tagline: tagline || null,
    rating: rating || null,
    runtime: runtime || null,
    genre: genre || null,
    director: director || null,
    cast: cast.length ? cast : null,
    synopsis: synopsis || null,
    production: production || null,
    score: score || null,
    cinematography: cinematography || null,
    backdrop: backdrop || null,
    poster: poster || null,
    releaseDate: toAmplifyDate(releaseDate),
    audienceScore: audienceScore || null,
    originalLanguage: originalLanguage || null,
    productionCompanies: productionCompanies.length ? productionCompanies : null,
    trailerYouTubeId: trailerYouTubeId || null,
    tmdbId: existingMovie.data.tmdbId ?? null,
  });

  if (result.errors?.length) {
    throw new Error(
      `Unable to update movie: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  await Promise.all([
    deleteManagedStorageObjectByUrl(
      existingMovie.data.poster && existingMovie.data.poster !== poster
        ? existingMovie.data.poster
        : null
    ),
    deleteManagedStorageObjectByUrl(
      existingMovie.data.backdrop && existingMovie.data.backdrop !== backdrop
        ? existingMovie.data.backdrop
        : null
    ),
  ]);

  revalidateMoviePaths(id);
  redirect(
    createAdminNoticeHref(`/admin/movies/${id}`, {
      type: "success",
      message: "Movie saved successfully.",
    })
  );
}

export async function deleteMovieAction(formData: FormData) {
  const id = getString(formData, "id");

  if (!id) {
    throw new Error("Missing movie id.");
  }

  const [existingMovie, bookingsResult] = await Promise.all([
    getMovieFromAmplify(id),
    listBookingsFromAmplify(),
  ]);

  if (existingMovie.errors?.length) {
    throw new Error(
      `Unable to load the existing movie: ${existingMovie.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (bookingsResult.errors?.length) {
    throw new Error(
      `Unable to load movie bookings: ${bookingsResult.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (!existingMovie.data) {
    throw new Error("The movie could not be found.");
  }

  const relatedBookings = bookingsResult.data.filter((booking) => booking.movieId === id);

  if (relatedBookings.length > 0) {
    throw new Error("Delete the related bookings before removing this movie.");
  }

  const result = await deleteMovieInAmplify(id);

  if (result.errors?.length) {
    throw new Error(
      `Unable to delete movie: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  await Promise.all([
    deleteManagedStorageObjectByUrl(existingMovie.data.poster),
    deleteManagedStorageObjectByUrl(existingMovie.data.backdrop),
  ]);

  revalidateMoviePaths(id);
  redirect(
    createAdminNoticeHref("/admin/movies", {
      type: "success",
      message: "Movie deleted successfully.",
    })
  );
}

export async function syncMovieFromTmdbAction(formData: FormData) {
  const id = getString(formData, "id");

  if (!id) {
    throw new Error("Missing movie id.");
  }

  const existingMovie = await getMovieFromAmplify(id);

  if (existingMovie.errors?.length) {
    throw new Error(
      `Unable to load the existing movie: ${existingMovie.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  if (!existingMovie.data) {
    throw new Error("The movie could not be found.");
  }

  if (!existingMovie.data.tmdbId) {
    throw new Error("This movie is not linked to TMDB.");
  }

  const candidate = await getTmdbImportCandidate(existingMovie.data.tmdbId);

  if (!candidate) {
    throw new Error("Unable to refresh this movie from TMDB right now.");
  }

  const result = await updateMovieInAmplify({
    id,
    title: candidate.title || existingMovie.data.title,
    tagline: candidate.tagline || null,
    runtime: candidate.runtime || null,
    genre: candidate.genres.join(" / ") || null,
    director: candidate.director || null,
    cast: candidate.castHighlights.length ? candidate.castHighlights : null,
    synopsis: candidate.overview || null,
    production: candidate.productionCompanies?.[0] ?? existingMovie.data.production ?? null,
    score: candidate.audienceScore ? `TMDB ${candidate.audienceScore}` : null,
    backdrop: candidate.backdrop || null,
    poster: candidate.poster || null,
    releaseDate: toAmplifyDate(candidate.releaseDate ?? "") ?? null,
    audienceScore: candidate.audienceScore ?? null,
    originalLanguage: candidate.originalLanguage ?? null,
    productionCompanies:
      candidate.productionCompanies?.length ? candidate.productionCompanies : null,
    trailerYouTubeId: candidate.trailerYouTubeId ?? null,
    tmdbId: existingMovie.data.tmdbId,
  });

  if (result.errors?.length) {
    throw new Error(
      `Unable to sync movie: ${result.errors
        .map((error) => error.message)
        .join("; ")}`
    );
  }

  await Promise.all([
    deleteManagedStorageObjectByUrl(
      existingMovie.data.poster && existingMovie.data.poster !== candidate.poster
        ? existingMovie.data.poster
        : null
    ),
    deleteManagedStorageObjectByUrl(
      existingMovie.data.backdrop && existingMovie.data.backdrop !== candidate.backdrop
        ? existingMovie.data.backdrop
        : null
    ),
  ]);

  revalidateMoviePaths(id);
  redirect(
    createAdminNoticeHref(`/admin/movies/${id}`, {
      type: "success",
      message: "Movie synced from TMDB successfully.",
    })
  );
}
