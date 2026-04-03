"use client";

import { type ChangeEvent, useRef, useState } from "react";

import { ImageUp, LoaderCircle, Trash2 } from "lucide-react";
import { remove, uploadData } from "aws-amplify/storage";

import { Button } from "@/components/ui/button";
import { AdminField } from "@/components/admin/admin-form";
import { ensureAmplifyConfigured } from "@/lib/amplify/client";
import {
  buildAmplifyStoragePublicUrl,
  getAmplifyStoragePathFromUrl,
} from "@/lib/amplify/storage";

const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  const subtype = file.type.split("/").pop()?.toLowerCase();
  return subtype && /^[a-z0-9]+$/.test(subtype) ? subtype : "jpg";
}

async function removeManagedImage(url: string) {
  const path = getAmplifyStoragePathFromUrl(url);

  if (!path) {
    return;
  }

  await remove({ path }).result;
}

export function AdminImageUploadField({
  label,
  description,
  uploadPathPrefix,
  value,
  onChange,
  previewLabel,
}: {
  label: string;
  description: string;
  uploadPathPrefix: string;
  value: string;
  onChange: (value: string) => void;
  previewLabel: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadedUrlsRef = useRef(new Set<string>());

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Select an image file.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setError("Select an image smaller than 20 MB.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      ensureAmplifyConfigured();

      const extension = getFileExtension(file);
      const baseName = sanitizeFileName(file.name) || "image";
      const path = `${uploadPathPrefix}/${Date.now()}-${baseName}-${crypto.randomUUID()}.${extension}`;
      const previousValue = value;

      const result = await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type,
          preventOverwrite: true,
        },
      }).result;

      const uploadedUrl = buildAmplifyStoragePublicUrl(result.path);

      uploadedUrlsRef.current.add(uploadedUrl);
      onChange(uploadedUrl);

      if (previousValue && uploadedUrlsRef.current.has(previousValue)) {
        await removeManagedImage(previousValue);
        uploadedUrlsRef.current.delete(previousValue);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    setError(null);

    try {
      if (value && uploadedUrlsRef.current.has(value)) {
        await removeManagedImage(value);
        uploadedUrlsRef.current.delete(value);
      }

      onChange("");
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Image removal failed."
      );
    }
  }

  return (
    <AdminField label={label} description={description}>
      <div className="flex flex-col gap-3 rounded-md border border-border/40 bg-surface-container-highest p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            className="justify-start"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <ImageUp />
            )}
            {isUploading ? "Uploading..." : "Upload from device"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void handleRemove()}
            disabled={isUploading || !value}
          >
            <Trash2 />
            Remove image
          </Button>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {previewLabel}
        </p>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </div>
    </AdminField>
  );
}
