import type { MembershipProgram } from "./types";
import { APP_NAME } from "@/lib/config";

export const memberships: MembershipProgram[] = [
  {
    id: "small-town-theater-membership",
    name: `${APP_NAME} Membership`,
    blurb:
      `Members help preserve small-town cinema across every ${APP_NAME} location while receiving early access, special invitations, and everyday perks wherever the organization programs films.`,
    benefits: [
      "Early ticket access",
      "Discounted tickets",
      "Concession perks",
      "Private event invitations",
    ],
    ctaLabel: "Become a Member",
    ctaHref: "/about",
  },
];
