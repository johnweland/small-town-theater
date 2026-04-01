import { StaffSignUpForm } from "@/components/auth/staff-sign-up-form";

type AdminSignUpPageProps = {
  searchParams: Promise<{
    email?: string;
    expires?: string;
    signature?: string;
  }>;
};

export default async function AdminSignUpPage({
  searchParams,
}: AdminSignUpPageProps) {
  const { email, expires, signature } = await searchParams;

  if (!email || !expires || !signature) {
    return <StaffSignUpForm mode="invalid" />;
  }

  const expiresAtDate = new Date(expires);
  const expiresLabel = Number.isNaN(expiresAtDate.getTime())
    ? null
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Chicago",
      }).format(expiresAtDate);

  return (
    <StaffSignUpForm
      mode="ready"
      invite={{
        email,
        expiresAt: expires,
        expiresLabel,
        signature,
      }}
    />
  );
}
