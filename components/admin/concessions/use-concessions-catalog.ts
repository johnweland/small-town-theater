"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import {
  buildConcessionsDataset,
  shouldPersistAvailabilityRow,
  toVenueItemAvailabilityCreateInput,
  toVenueItemAvailabilityUpdateInput,
  toVenueItemCreateInput,
  toVenueItemUpdateInput,
  type ConcessionsCatalogItem,
  type ConcessionsDataset,
} from "@/lib/admin/concessions";
import { getAmplifyClient } from "@/lib/amplify/client";

type ModelOperationError = { message: string };
const concessionsTheaterSelection = ["id", "name"] as const;

function joinErrors(errors?: readonly ModelOperationError[]) {
  return errors?.map((error) => error.message).join("; ") ?? "An unexpected error occurred.";
}

function toUserActionErrorMessage(
  message: string,
  fallback: string
) {
  if (
    /amplify|appsync|apiKey|schema|VenueItem|VenueItemAvailability/i.test(message)
  ) {
    return fallback;
  }

  return message;
}

function getVenueItemModel(client: ReturnType<typeof getAmplifyClient>) {
  const model = (client.models as Record<string, unknown>).VenueItem;

  if (!model) {
    throw new Error(
      "Catalog items are not available right now. Refresh the page and try again."
    );
  }

  return model as typeof client.models.VenueItem;
}

function getVenueItemAvailabilityModel(client: ReturnType<typeof getAmplifyClient>) {
  const model = (client.models as Record<string, unknown>).VenueItemAvailability;

  if (!model) {
    throw new Error(
      "Item availability is not available right now. Refresh the page and try again."
    );
  }

  return model as typeof client.models.VenueItemAvailability;
}

async function fetchConcessionsDataset() {
  const client = getAmplifyClient();
  const venueItemModel = getVenueItemModel(client);
  const availabilityModel = getVenueItemAvailabilityModel(client);

  const [itemsResult, availabilityResult, theatersResult] = await Promise.all([
    venueItemModel.list({ authMode: "apiKey" }),
    availabilityModel.list({ authMode: "apiKey" }),
    client.models.Theater.list({
      authMode: "apiKey",
      selectionSet: concessionsTheaterSelection,
    }),
  ]);

  const firstError =
    itemsResult.errors?.[0] ??
    availabilityResult.errors?.[0] ??
    theatersResult.errors?.[0];

  if (firstError) {
    throw new Error(joinErrors([firstError]));
  }

  return buildConcessionsDataset({
    items: itemsResult.data,
    availability: availabilityResult.data,
    theaters: theatersResult.data,
  });
}

async function syncAvailabilityRows(
  itemId: string,
  availability: ConcessionsCatalogItem["availability"]
) {
  const client = getAmplifyClient();
  const availabilityModel = getVenueItemAvailabilityModel(client);

  const toPersist = availability
    .map((row) => ({ ...row, itemId }))
    .filter(shouldPersistAvailabilityRow);
  const toDelete = availability
    .map((row) => ({ ...row, itemId }))
    .filter((row) => row.id && !shouldPersistAvailabilityRow(row));

  const writes = await Promise.all([
    ...toPersist.map((row) =>
      row.id
        ? availabilityModel.update(toVenueItemAvailabilityUpdateInput(row), {
            authMode: "apiKey",
          })
        : availabilityModel.create(toVenueItemAvailabilityCreateInput(row), {
            authMode: "apiKey",
          })
    ),
    ...toDelete.map((row) =>
      availabilityModel.delete({ id: row.id! }, { authMode: "apiKey" })
    ),
  ]);

  const errors = writes.flatMap((result) => result.errors ?? []);

  if (errors.length) {
    throw new Error(joinErrors(errors));
  }
}

async function createVenueItem(input: ConcessionsCatalogItem) {
  const client = getAmplifyClient();
  const venueItemModel = getVenueItemModel(client);
  const result = await venueItemModel.create(
    toVenueItemCreateInput(input),
    { authMode: "apiKey" }
  );

  if (result.errors?.length || !result.data) {
    throw new Error(joinErrors(result.errors));
  }

  await syncAvailabilityRows(result.data.id, input.availability);

  return result.data;
}

async function updateVenueItem(input: ConcessionsCatalogItem) {
  const client = getAmplifyClient();
  const venueItemModel = getVenueItemModel(client);
  const result = await venueItemModel.update(
    toVenueItemUpdateInput(input),
    { authMode: "apiKey" }
  );

  if (result.errors?.length || !result.data) {
    throw new Error(joinErrors(result.errors));
  }

  await syncAvailabilityRows(result.data.id, input.availability);

  return result.data;
}

async function duplicateVenueItem(item: ConcessionsCatalogItem) {
  return createVenueItem({
    ...item,
    id: "new-item",
    name: `${item.name} Copy`,
    sku: `${item.sku}-COPY`,
    availability: item.availability.map((row) => ({
      ...row,
      id: undefined,
      itemId: "new-item",
    })),
  });
}

async function toggleVenueItemActive(item: ConcessionsCatalogItem) {
  const client = getAmplifyClient();
  const venueItemModel = getVenueItemModel(client);
  const result = await venueItemModel.update(
    {
      id: item.id,
      isActive: !item.isActive,
    },
    { authMode: "apiKey" }
  );

  if (result.errors?.length) {
    throw new Error(joinErrors(result.errors));
  }
}

async function deleteVenueItem(item: ConcessionsCatalogItem) {
  const client = getAmplifyClient();
  const venueItemModel = getVenueItemModel(client);
  const availabilityModel = getVenueItemAvailabilityModel(client);

  const availabilityDeletes = item.availability
    .filter((row) => Boolean(row.id))
    .map((row) => availabilityModel.delete({ id: row.id! }, { authMode: "apiKey" }));

  const availabilityResults = await Promise.all(availabilityDeletes);
  const availabilityErrors = availabilityResults.flatMap((result) => result.errors ?? []);

  if (availabilityErrors.length) {
    throw new Error(joinErrors(availabilityErrors));
  }

  const result = await venueItemModel.delete({ id: item.id }, { authMode: "apiKey" });

  if (result.errors?.length) {
    throw new Error(joinErrors(result.errors));
  }
}

export function useConcessionsCatalog({
  initialData,
  initialError = null,
}: {
  initialData: ConcessionsDataset;
  initialError?: string | null;
}) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(initialData.items.length === 0 && !initialError);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function refreshData(options?: { silent?: boolean }) {
    if (!options?.silent) {
      setIsLoading(true);
    }

    try {
      const nextData = await fetchConcessionsDataset();
      setData(nextData);
      setError(null);
    } catch (refreshError) {
      setError(
        refreshError instanceof Error ? refreshError.message : "Unable to load concessions data."
      );
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    if (initialData.items.length || initialData.theaters.length || initialError) {
      return;
    }

    void refreshData();
  }, [initialData.items.length, initialData.theaters.length, initialError]);

  useEffect(() => {
    const client = getAmplifyClient();
    let cancelled = false;

    let venueItemModel: typeof client.models.VenueItem;
    let availabilityModel: typeof client.models.VenueItemAvailability;

    try {
      venueItemModel = getVenueItemModel(client);
      availabilityModel = getVenueItemAvailabilityModel(client);
    } catch (subscriptionError) {
      setError(
        subscriptionError instanceof Error
          ? subscriptionError.message
          : "Unable to start concessions subscriptions."
      );
      return;
    }

    const refresh = () => {
      if (!cancelled) {
        void refreshData({ silent: true });
      }
    };

    const subscriptions = [
      venueItemModel.onCreate({ authMode: "apiKey" }).subscribe({ next: refresh }),
      venueItemModel.onUpdate({ authMode: "apiKey" }).subscribe({ next: refresh }),
      venueItemModel.onDelete({ authMode: "apiKey" }).subscribe({ next: refresh }),
      availabilityModel.onCreate({ authMode: "apiKey" }).subscribe({ next: refresh }),
      availabilityModel.onUpdate({ authMode: "apiKey" }).subscribe({ next: refresh }),
      availabilityModel.onDelete({ authMode: "apiKey" }).subscribe({ next: refresh }),
    ];

    return () => {
      cancelled = true;
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, []);

  async function saveItem(item: ConcessionsCatalogItem, mode: "create" | "edit") {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (mode === "create") {
        await createVenueItem(item);
        toast.success("Catalog item created.", {
          description: "The item is ready to manage across your theaters.",
        });
      } else {
        await updateVenueItem(item);
        toast.success("Catalog item saved.", {
          description: "Your latest changes are now live in the catalog.",
        });
      }

      await refreshData({ silent: true });
    } catch (saveItemError) {
      const message =
        saveItemError instanceof Error
          ? toUserActionErrorMessage(
              saveItemError.message,
              "We couldn't save this item right now. Please try again."
            )
          : "Unable to save the catalog item.";
      setSaveError(message);
      toast.error("Save failed.", { description: message });
      throw saveItemError;
    } finally {
      setIsSaving(false);
    }
  }

  async function duplicateItem(item: ConcessionsCatalogItem) {
    try {
      await duplicateVenueItem(item);
      toast.success("Catalog item duplicated.", {
        description: "A copy has been added to the catalog.",
      });
      await refreshData({ silent: true });
    } catch (duplicateError) {
      const message =
        duplicateError instanceof Error
          ? toUserActionErrorMessage(
              duplicateError.message,
              "We couldn't duplicate this item right now. Please try again."
            )
          : "Unable to duplicate the item.";
      toast.error("Duplicate failed.", { description: message });
    }
  }

  async function toggleItemActive(item: ConcessionsCatalogItem) {
    try {
      await toggleVenueItemActive(item);
      await refreshData({ silent: true });
      toast.success(item.isActive ? "Catalog item deactivated." : "Catalog item activated.", {
        description: item.isActive
          ? "The item is no longer active in the catalog."
          : "The item is now active in the catalog.",
      });
    } catch (toggleError) {
      const message =
        toggleError instanceof Error
          ? toUserActionErrorMessage(
              toggleError.message,
              "We couldn't update this item right now. Please try again."
            )
          : "Unable to update item status.";
      toast.error("Status update failed.", { description: message });
    }
  }

  async function deleteItem(item: ConcessionsCatalogItem) {
    setIsSaving(true);
    setSaveError(null);

    try {
      await deleteVenueItem(item);
      await refreshData({ silent: true });
      toast.success("Catalog item deleted.", {
        description: "The item has been removed from the concessions catalog.",
      });
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? toUserActionErrorMessage(
              deleteError.message,
              "We couldn't delete this item right now. Please try again."
            )
          : "Unable to delete the item.";
      setSaveError(message);
      toast.error("Delete failed.", { description: message });
      throw deleteError;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    data,
    error,
    isLoading,
    isSaving,
    saveError,
    clearSaveError: () => setSaveError(null),
    refreshData,
    saveItem,
    duplicateItem,
    toggleItemActive,
    deleteItem,
  };
}
