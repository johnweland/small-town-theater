import type { MetadataRoute } from "next";

import { getBaseUrl, getMovies, getTheaters } from "@/lib/seo";

export const revalidate = 300;

function toAbsoluteUrl(pathname: string) {
  return `${getBaseUrl()}${pathname}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [movies, theaters] = await Promise.all([getMovies(), getTheaters()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: toAbsoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: toAbsoluteUrl("/showtimes"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const movieRoutes: MetadataRoute.Sitemap = movies.map((movie) => ({
    url: toAbsoluteUrl(`/movie/${movie.slug}`),
    lastModified: movie.updatedAt ?? new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const theaterRoutes: MetadataRoute.Sitemap = theaters.map((theater) => ({
    url: toAbsoluteUrl(`/theater/${theater.slug}`),
    lastModified: theater.updatedAt ?? new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // After an admin publish/update action, you can refresh this early with:
  // revalidatePath("/sitemap.xml");
  return [...staticRoutes, ...movieRoutes, ...theaterRoutes];
}
