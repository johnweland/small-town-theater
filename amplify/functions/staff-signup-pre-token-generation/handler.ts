import type { PreTokenGenerationTriggerHandler } from "aws-lambda";

const STAFF_ATTRIBUTE_KEY = "custom:isAdminStaff";

export const handler: PreTokenGenerationTriggerHandler = async (event) => {
  const isAdminStaff = event.request.userAttributes[STAFF_ATTRIBUTE_KEY] === "true";

  if (!isAdminStaff) {
    return event;
  }

  event.response.claimsOverrideDetails = {
    ...event.response.claimsOverrideDetails,
    groupOverrideDetails: {
      ...event.request.groupConfiguration,
      groupsToOverride: ["ADMINS"],
    },
  };

  return event;
};
