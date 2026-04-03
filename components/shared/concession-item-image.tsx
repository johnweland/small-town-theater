/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { getUrl } from "aws-amplify/storage";

import { ensureAmplifyConfigured } from "@/lib/amplify/client";
import { getAmplifyStoragePathFromUrl } from "@/lib/amplify/storage";
import { cn } from "@/lib/utils";
import { CONCESSION_ITEM_PLACEHOLDER_IMAGE } from "@/lib/concessions";

export function ConcessionItemImage({
  src,
  alt,
  className,
  imageClassName,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  const trimmedSrc = src?.trim() || CONCESSION_ITEM_PLACEHOLDER_IMAGE;
  const storagePath = getAmplifyStoragePathFromUrl(trimmedSrc);
  const [resolvedStorageImage, setResolvedStorageImage] = useState<{
    path: string;
    url: string;
  } | null>(null);
  const currentSrc =
    storagePath && trimmedSrc !== CONCESSION_ITEM_PLACEHOLDER_IMAGE
      ? (resolvedStorageImage?.path === storagePath
          ? resolvedStorageImage.url
          : CONCESSION_ITEM_PLACEHOLDER_IMAGE)
      : trimmedSrc;

  useEffect(() => {
    let cancelled = false;

    if (!storagePath || trimmedSrc === CONCESSION_ITEM_PLACEHOLDER_IMAGE) {
      return;
    }

    void (async () => {
      try {
        ensureAmplifyConfigured();
        const result = await getUrl({
          path: storagePath,
        });

        if (!cancelled) {
          setResolvedStorageImage({
            path: storagePath,
            url: result.url.toString(),
          });
        }
      } catch {
        if (!cancelled) {
          setResolvedStorageImage({
            path: storagePath,
            url: CONCESSION_ITEM_PLACEHOLDER_IMAGE,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [storagePath, trimmedSrc]);

  return (
    <div className={cn("overflow-hidden rounded-md bg-surface-container-high", className)}>
      <img
        src={currentSrc}
        alt={alt}
        className={cn("h-full w-full object-cover", imageClassName)}
        onError={() => {
          if (storagePath) {
            setResolvedStorageImage({
              path: storagePath,
              url: CONCESSION_ITEM_PLACEHOLDER_IMAGE,
            });
          }
        }}
      />
    </div>
  );
}
