export function resolveDisplayName(displayName?: string | null, email?: string | null) {
  return displayName?.trim() || email?.trim() || "Admin";
}

export function getUserInitials(displayName?: string | null, email?: string | null) {
  const source = displayName?.trim() || email?.trim() || "";

  if (!source) {
    return "AD";
  }

  if (displayName?.trim()) {
    const words = displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return words.map((word) => word[0]?.toUpperCase() ?? "").join("") || "AD";
  }

  return source.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "AD";
}

export function resolveAvatarUrl({
  uploadedAvatarUrl,
  gravatarUrl,
}: {
  uploadedAvatarUrl?: string | null;
  gravatarUrl?: string | null;
}) {
  const normalizedUploadedAvatarUrl = uploadedAvatarUrl?.trim();

  if (normalizedUploadedAvatarUrl) {
    return normalizedUploadedAvatarUrl;
  }

  return gravatarUrl?.trim() || null;
}
