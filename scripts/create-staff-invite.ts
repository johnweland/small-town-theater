import { createStaffInviteUrl } from "../lib/auth/staff-invite";

const [email, siteUrl = "http://localhost:3000", durationHours = "24"] =
  process.argv.slice(2);

if (!email) {
  console.error(
    "Usage: npx tsx scripts/create-staff-invite.ts <email> [siteUrl] [durationHours]"
  );
  process.exit(1);
}

const secret = process.env.STAFF_SIGNUP_SECRET;

if (!secret) {
  console.error("Set STAFF_SIGNUP_SECRET before generating invite links.");
  process.exit(1);
}

const hours = Number(durationHours);

if (!Number.isFinite(hours) || hours <= 0) {
  console.error("durationHours must be a positive number.");
  process.exit(1);
}

const normalizedEmail = email.trim().toLowerCase();
const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
console.log(
  createStaffInviteUrl({
    baseUrl: siteUrl,
    payload: {
      email: normalizedEmail,
      expiresAt,
    },
    secret,
  })
);
