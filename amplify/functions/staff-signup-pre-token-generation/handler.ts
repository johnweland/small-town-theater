import type { PreTokenGenerationTriggerHandler } from "aws-lambda";

const STAFF_ATTRIBUTE_KEY = "custom:isAdminStaff";
const OWNER_ATTRIBUTE_KEY = "custom:isOwner";

export const handler: PreTokenGenerationTriggerHandler = async (event) => {
  const isAdminStaff = event.request.userAttributes[STAFF_ATTRIBUTE_KEY] === "true";
  const isOwner = event.request.userAttributes[OWNER_ATTRIBUTE_KEY] === "true";

  if (!isAdminStaff) {
    return event;
  }

  const existingGroups = new Set(event.request.groupConfiguration.groupsToOverride ?? []);
  existingGroups.add("ADMINS");

  if (isOwner) {
    existingGroups.add("OWNERS");
  }

  event.response.claimsOverrideDetails = {
    ...event.response.claimsOverrideDetails,
    groupOverrideDetails: {
      ...event.request.groupConfiguration,
      groupsToOverride: Array.from(existingGroups),
    },
  };

  return event;
};
