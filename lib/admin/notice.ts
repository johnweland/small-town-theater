export type AdminNoticeType = "success" | "error";

export function createAdminNoticeHref(
  pathname: string,
  {
    type,
    message,
  }: {
    type: AdminNoticeType;
    message: string;
  }
) {
  const params = new URLSearchParams({
    notice: type,
    message,
  });

  return `${pathname}?${params.toString()}`;
}
