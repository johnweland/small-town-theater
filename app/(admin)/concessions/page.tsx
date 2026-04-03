import { ConcessionsInventoryView } from "@/components/admin/concessions/concessions-inventory-view";
import { getMockConcessionsDataset } from "@/lib/admin/concessions";

export default function ConcessionsPage() {
  const { items, theaters } = getMockConcessionsDataset();

  return <ConcessionsInventoryView initialItems={items} theaters={theaters} />;
}
