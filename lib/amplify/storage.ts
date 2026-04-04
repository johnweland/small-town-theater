import { amplifyStorageConfig } from "@/lib/amplify/runtime-config";

const storage = amplifyStorageConfig;

if (!storage) {
  throw new Error("Amplify storage outputs are unavailable.");
}

export const amplifyStorageBucketName = storage.bucket_name;
export const amplifyStorageRegion = storage.aws_region;
export const amplifyStoragePublicHostname = `${amplifyStorageBucketName}.s3.${amplifyStorageRegion}.amazonaws.com`;

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function buildAmplifyStoragePublicUrl(path: string) {
  const normalizedPath = path.replace(/^\/+/, "");
  return `https://${amplifyStoragePublicHostname}/${encodeStoragePath(normalizedPath)}`;
}

export function getAmplifyStoragePathFromUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname !== amplifyStoragePublicHostname) {
      return null;
    }

    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
  } catch {
    return null;
  }
}

export function isAmplifyStorageUrl(url?: string | null) {
  return getAmplifyStoragePathFromUrl(url) !== null;
}
