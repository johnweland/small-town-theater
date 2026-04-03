import { ConcessionsInventoryView } from "@/components/admin/concessions/concessions-inventory-view";
import { buildConcessionsDataset } from "@/lib/admin/concessions";
import {
  listPublicTheatersFromAmplify,
  listPublicVenueItemAvailabilityFromAmplify,
  listPublicVenueItemsFromAmplify,
} from "@/lib/amplify/public-server";

export default async function ConcessionsPage() {
  try {
    const [itemsResult, availabilityResult, theatersResult] = await Promise.all([
      listPublicVenueItemsFromAmplify(),
      listPublicVenueItemAvailabilityFromAmplify(),
      listPublicTheatersFromAmplify(),
    ]);

    const errorMessages = [
      ...(itemsResult.errors?.map((error) => error.message) ?? []),
      ...(availabilityResult.errors?.map((error) => error.message) ?? []),
      ...(theatersResult.errors?.map((error) => error.message) ?? []),
    ];

    return (
      <ConcessionsInventoryView
        initialData={buildConcessionsDataset({
          items: itemsResult.data,
          availability: availabilityResult.data,
          theaters: theatersResult.data,
        })}
        initialError={errorMessages.length ? errorMessages.join("; ") : null}
      />
    );
  } catch (error) {
    return (
      <ConcessionsInventoryView
        initialData={{ items: [], theaters: [] }}
        initialError={
          error instanceof Error
            ? error.message
            : "Unable to load concessions data from Amplify."
        }
      />
    );
  }
}
