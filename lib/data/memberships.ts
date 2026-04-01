import type { MembershipProgram } from "./types";

export const memberships: MembershipProgram[] = [
  {
    id: "small-town-theater-membership",
    name: "Small Town Theater Membership",
    blurb:
      "Members help preserve small-town cinema across every Small Town Theater location while receiving early access, special invitations, and everyday perks wherever the organization programs films.",
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
