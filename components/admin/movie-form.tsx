"use client";

import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { AdminSectionCard } from "@/components/admin/section-card";
import {
  AdminField,
  AdminFieldGrid,
  AdminInput,
  AdminMockForm,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/admin-form";
import { Button } from "@/components/ui/button";

type AdminMovieFormValue = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  rating: string;
  runtime: string;
  genre: string;
  status: "draft" | "comingSoon" | "nowPlaying" | "archived";
  director: string;
  cast: string[];
  synopsis: string;
  production: string;
  score: string;
  cinematography: string;
  backdrop: string;
  poster: string;
  releaseDate?: string;
  audienceScore?: string;
  originalLanguage?: string;
  productionCompanies: string[];
  trailerYouTubeId?: string;
};

export function AdminMovieForm({
  movie,
  action,
}: {
  movie: AdminMovieFormValue;
  action?: (formData: FormData) => void | Promise<void>;
}) {
  const formSections = (
    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="flex flex-col gap-8">
        <input type="hidden" name="id" value={movie.id} />
        <AdminSectionCard
          title="Library Metadata"
          description="Update the saved movie record without changing any related bookings."
        >
          <AdminFieldGrid>
            <AdminField label="Title">
              <AdminInput name="title" defaultValue={movie.title} required />
            </AdminField>
            <AdminField label="Slug">
              <AdminInput name="slug" defaultValue={movie.slug} required />
            </AdminField>
            <AdminField label="Status">
              <AdminSelect name="status" defaultValue={movie.status} required>
                <option value="draft">Draft</option>
                <option value="comingSoon">Coming Soon</option>
                <option value="nowPlaying">Now Playing</option>
                <option value="archived">Archived</option>
              </AdminSelect>
            </AdminField>
            <AdminField label="Release Date">
              <AdminInput
                name="releaseDate"
                type="date"
                defaultValue={movie.releaseDate ?? ""}
              />
            </AdminField>
            <AdminField label="Rating">
              <AdminInput name="rating" defaultValue={movie.rating} placeholder="PG" />
            </AdminField>
            <AdminField label="Runtime">
              <AdminInput name="runtime" defaultValue={movie.runtime} placeholder="1h 32m" />
            </AdminField>
            <AdminField label="Genre">
              <AdminInput
                name="genre"
                defaultValue={movie.genre}
                placeholder="Adventure / Comedy"
              />
            </AdminField>
            <AdminField label="Audience Score">
              <AdminInput
                name="audienceScore"
                defaultValue={movie.audienceScore ?? ""}
                placeholder="95%"
              />
            </AdminField>
            <AdminField label="Original Language">
              <AdminInput
                name="originalLanguage"
                defaultValue={movie.originalLanguage ?? ""}
                placeholder="English"
              />
            </AdminField>
            <AdminField label="Trailer YouTube Id">
              <AdminInput
                name="trailerYouTubeId"
                defaultValue={movie.trailerYouTubeId ?? ""}
                placeholder="abc123xyz"
              />
            </AdminField>
          </AdminFieldGrid>

          <div className="mt-5 grid gap-5">
            <AdminField label="Tagline">
              <AdminInput
                name="tagline"
                defaultValue={movie.tagline}
                placeholder="A quick internal-ready tagline."
              />
            </AdminField>
            <AdminField label="Synopsis">
              <AdminTextarea
                name="synopsis"
                defaultValue={movie.synopsis}
                placeholder="Movie synopsis..."
              />
            </AdminField>
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Creative Credits"
          description="Maintain the programming-facing credits and supporting metadata."
        >
          <AdminFieldGrid>
            <AdminField label="Director">
              <AdminInput name="director" defaultValue={movie.director} />
            </AdminField>
            <AdminField label="Production">
              <AdminInput name="production" defaultValue={movie.production} />
            </AdminField>
            <AdminField label="Score">
              <AdminInput name="score" defaultValue={movie.score} />
            </AdminField>
            <AdminField label="Cinematography">
              <AdminInput name="cinematography" defaultValue={movie.cinematography} />
            </AdminField>
          </AdminFieldGrid>
          <div className="mt-5 grid gap-5">
            <AdminField label="Cast Highlights" description="One cast member per line.">
              <AdminTextarea
                name="cast"
                defaultValue={movie.cast.join("\n")}
                placeholder="Chris Pratt&#10;Anya Taylor-Joy"
              />
            </AdminField>
            <AdminField
              label="Production Companies"
              description="One company per line."
            >
              <AdminTextarea
                name="productionCompanies"
                defaultValue={movie.productionCompanies.join("\n")}
                placeholder="Illumination&#10;Nintendo"
              />
            </AdminField>
          </div>
        </AdminSectionCard>
      </div>

      <div className="flex flex-col gap-8">
        <AdminSectionCard
          title="Artwork & Preview"
          description="Keep poster and backdrop URLs editable for imported or custom assets."
        >
          <div className="grid gap-5">
            <AdminField label="Poster URL">
              <AdminInput
                name="poster"
                defaultValue={movie.poster}
                placeholder="https://..."
              />
            </AdminField>
            <AdminField label="Backdrop URL">
              <AdminInput
                name="backdrop"
                defaultValue={movie.backdrop}
                placeholder="https://..."
              />
            </AdminField>
            <div className="rounded-lg bg-surface-container-high p-4">
              <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                Current poster
              </p>
              <p className="mt-2 break-all text-sm text-muted-foreground">{movie.poster}</p>
            </div>
            <div className="rounded-lg bg-surface-container-high p-4">
              <p className="font-sans text-[10px] uppercase tracking-[0.22em] text-primary">
                Current backdrop
              </p>
              <p className="mt-2 break-all text-sm text-muted-foreground">{movie.backdrop}</p>
            </div>
          </div>
        </AdminSectionCard>
      </div>
    </div>
  );

  if (!action) {
    return (
      <AdminMockForm
        submitLabel="Save Movie"
        submitDescription="Movie editing is structured and ready for review."
      >
        {formSections}
      </AdminMockForm>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-8">
      {formSections}
      <div className="flex flex-col gap-4 rounded-lg bg-surface-container-high p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-sans text-sm font-semibold text-foreground">Movie workflow</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Saving this form updates the library record and refreshes the admin views.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button type="reset" variant="outline">
            Reset
          </Button>
          <AdminSubmitButton idleLabel="Save Movie" />
        </div>
      </div>
    </form>
  );
}
