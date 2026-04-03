"use client";

import { useEffect, useState } from "react";

import { getUrl } from "aws-amplify/storage";

import { AvatarImage } from "@/components/ui/avatar";
import { ensureAmplifyConfigured } from "@/lib/amplify/client";
import { getAmplifyStoragePathFromUrl } from "@/lib/amplify/storage";

export function ResolvedAvatarImage({
  alt,
  src,
}: {
  alt: string;
  src?: string | null;
}) {
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(
    src?.trim() || undefined
  );

  useEffect(() => {
    let isActive = true;

    async function resolveSource() {
      const normalizedSrc = src?.trim();

      if (!normalizedSrc) {
        if (isActive) {
          setResolvedSrc(undefined);
        }
        return;
      }

      const storagePath = getAmplifyStoragePathFromUrl(normalizedSrc);

      if (!storagePath) {
        if (isActive) {
          setResolvedSrc(normalizedSrc);
        }
        return;
      }

      try {
        ensureAmplifyConfigured();

        const result = await getUrl({
          path: storagePath,
        });

        if (isActive) {
          setResolvedSrc(result.url.toString());
        }
      } catch {
        if (isActive) {
          setResolvedSrc(undefined);
        }
      }
    }

    void resolveSource();

    return () => {
      isActive = false;
    };
  }, [src]);

  return <AvatarImage src={resolvedSrc} alt={alt} />;
}
