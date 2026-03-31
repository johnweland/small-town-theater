import type { Theater } from "./types";

export const theaters: Theater[] = [
  {
    id: "jackson",
    name: "Jackson Theater",
    district: "Downtown",
    established: 1928,
    address: "1248 North Main Street · Downtown Historic District",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBoDKlDYpeVPNziGWRArXpb91dpx9319A84alSsuRftSjoR5aA7fi27ZKs6ockIvmyL6G1XbyB84C8DSh0CTLjbP6Fgo1dHcmy4tWpXZPeZtv2bFkYIOJPUCxpW2xhl3Gz211IKxZiFHNAK3lYjJaw3vOi4AgvE0rcvYP-Q9JEpRy2gut3AGohOZ7SSeFm8rLzBKCJSp2QfJo6xx_gPHRZm33uP13JvsOVFv16QPGf5ln350DX-aREK0SZfh9ogPet_sZCd_v9_ZtU",
    descriptionParagraphs: [
      "Since 1928, the Jackson Theater has stood as the heart of downtown—where the community has gathered to share in laughter, tears, and wonder. Meticulously preserved, its original velvet seating and gilded proscenium arch have welcomed generations of film lovers.",
      "When the theater faced closure in 2012, local residents launched a grassroots campaign that saved not just a building, but a way of life. Today it stands fully restored—a landmark of culture and community.",
    ],
    specs: [
      { label: "Screen", value: "1 Screen · Classic 35mm Projection" },
      { label: "Seating", value: "224 Seats · Original Velvet" },
      { label: "Location", value: "1248 N Main St, Downtown" },
      { label: "Parking", value: "Free street parking after 6 PM" },
      { label: "Phone", value: "(555) 010-1928" },
    ],
    concessions: [
      { name: "Real Butter Popcorn", price: "$8", note: "Members: free refills" },
      { name: "Small Batch Sodas", price: "$6", note: "Cherry, vanilla, & seasonal" },
      { name: "Local Truffles", price: "$12", note: "From Main Street Sweets" },
    ],
    memberBenefits: [
      "Early ticket access",
      "Free concession refills",
      "Private screening invitations",
      "Discounted tickets",
    ],
    memberBlurb:
      "Members enjoy early access to screenings, complimentary concessions refills, and invitations to private events. Help preserve small-town cinema for the next generation.",
  },
  {
    id: "sherburn",
    name: "Sherburn Theater",
    district: "Heritage Row",
    established: 1948,
    address: "412 Heritage Row · Eastside Arts Village",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1MXrFdHN_TIqWls3zgPPjs_y9M8RjFN5N1yedYoabe3kdq8hrIC8ttzRjJ32cPm86CPXQMLYyZ8-Q6Ub4qVw83XLJacWH-FH4mdu26x0EjZhDxfpPiobDltNnneWq0siDmUx7aq43IjktLI_PjKsEEOhKlT9kW7M9AzGkn4sg0ozvOzgPxPSqTutn9EzWY1e3a8Ua5GncbVKvLNfUwmIP2tuha-LTfQKZDHOWbtJeNs7960MapSYARdNW-FZ8VnlUHoARwBamXM",
    descriptionParagraphs: [
      "Since 1948, the Sherburn Theater has been the region's home for adventurous film programming. Known for its intimate single-screen experience and curated selections, the Sherburn remains the venue of choice for independent cinema, restored classics, and specialty 70mm presentations.",
      "The adjacent outdoor courtyard hosts summer screenings and community gatherings—a living extension of the cinema into the neighborhood it has served for over 75 years.",
    ],
    specs: [
      { label: "Screen", value: "1 Screen · 70mm Capable" },
      { label: "Seating", value: "156 Seats · Boutique Style" },
      { label: "Location", value: "412 Heritage Row, Eastside" },
      { label: "Courtyard", value: "Open Apr – Oct" },
      { label: "Phone", value: "(555) 010-1948" },
    ],
    concessions: [
      {
        name: "Artisan Coffee Bar",
        price: "$5–$7",
        note: "Single-origin espresso & pour-overs",
      },
      {
        name: "Seasonal Concessions",
        price: "$6–$10",
        note: "Local ingredients, rotating menu",
      },
      {
        name: "Outdoor Courtyard",
        price: "Free",
        note: "Open before & after evening shows",
      },
    ],
    memberBenefits: [
      "Priority 70mm access",
      "Coffee bar discounts",
      "Courtyard event invites",
      "Discounted tickets",
    ],
    memberBlurb:
      "Members enjoy priority access to specialty 70mm screenings, courtyard events, and discounts at the coffee bar. Help preserve independent cinema for generations to come.",
  },
];
