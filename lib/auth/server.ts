import { createHash } from "node:crypto";

import { cookies } from "next/headers";
import {
  AdminDeleteUserCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import {
  createAWSCredentialsAndIdentityIdProvider,
  createKeyValueStorageFromCookieStorageAdapter,
  createUserPoolsTokenProvider,
  runWithAmplifyServerContext,
  type CookieStorage,
} from "aws-amplify/adapter-core";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth/server";

import { amplifyAuthConfig, amplifyConfig } from "@/lib/amplify/runtime-config";
import { resolveAvatarUrl } from "@/lib/auth/profile";
import { isE2ETestMode } from "@/lib/e2e/config";

const config = amplifyConfig;
const authConfig = amplifyAuthConfig;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

type StaffSession = {
  avatarPreference: "uploaded" | "gravatar" | "initials";
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
  gravatarUrl: string | null;
  groups: string[];
  isAdmin: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  uploadedAvatarUrl: string | null;
};

export type StaffDirectoryUser = {
  createdAt: Date | null;
  displayName: string | null;
  email: string | null;
  enabled: boolean;
  isOwner: boolean;
  status: string | null;
  username: string;
};

function createCookieStorageAdapter(store: CookieStore): CookieStorage.Adapter {
  return {
    getAll() {
      return store.getAll().map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
      }));
    },
    get(name) {
      const cookie = store.get(name);

      if (!cookie) {
        return undefined;
      }

      return {
        name: cookie.name,
        value: cookie.value,
      };
    },
    set(name, value, options) {
      store.set(name, value, options);
    },
    delete(name) {
      store.delete(name);
    },
  };
}

function createReadOnlyCookieStorageAdapter(
  store: CookieStore
): CookieStorage.Adapter {
  return {
    getAll() {
      return createCookieStorageAdapter(store).getAll();
    },
    get(name) {
      return createCookieStorageAdapter(store).get(name);
    },
    // Server component renders can read request cookies, but Next.js only allows
    // emitting Set-Cookie headers from server actions or route handlers.
    set() {},
    delete() {},
  };
}

function createEmptyCookieStorageAdapter(): CookieStorage.Adapter {
  return {
    getAll() {
      return [];
    },
    get() {
      return undefined;
    },
    set() {},
    delete() {},
  };
}

export async function runWithAuthServerContext<Result>(
  operation: Parameters<typeof runWithAmplifyServerContext<Result>>[2]
) {
  const cookieStore = await cookies();

  if (!config.Auth) {
    throw new Error("Amplify Auth is not configured.");
  }

  const keyValueStorage = createKeyValueStorageFromCookieStorageAdapter(
    createReadOnlyCookieStorageAdapter(cookieStore)
  );

  return runWithAmplifyServerContext(
    config,
    {
      Auth: {
        tokenProvider: createUserPoolsTokenProvider(config.Auth, keyValueStorage),
        credentialsProvider: createAWSCredentialsAndIdentityIdProvider(
          config.Auth,
          keyValueStorage
        ),
      },
    },
    operation
  );
}

export async function runWithGuestServerContext<Result>(
  operation: Parameters<typeof runWithAmplifyServerContext<Result>>[2]
) {
  if (!config.Auth) {
    throw new Error("Amplify Auth is not configured.");
  }

  const keyValueStorage = createKeyValueStorageFromCookieStorageAdapter(
    createEmptyCookieStorageAdapter()
  );

  return runWithAmplifyServerContext(
    config,
    {
      Auth: {
        tokenProvider: createUserPoolsTokenProvider(config.Auth, keyValueStorage),
        credentialsProvider: createAWSCredentialsAndIdentityIdProvider(
          config.Auth,
          keyValueStorage
        ),
      },
    },
    operation
  );
}

function readGroupsFromSession(session: Awaited<ReturnType<typeof fetchAuthSession>>) {
  const tokenGroups =
    session.tokens?.accessToken.payload["cognito:groups"] ??
    session.tokens?.idToken?.payload["cognito:groups"];

  if (!Array.isArray(tokenGroups)) {
    return [];
  }

  return tokenGroups.filter((group): group is string => typeof group === "string");
}

function readDisplayNameFromSession(
  session: Awaited<ReturnType<typeof fetchAuthSession>>
) {
  const name = session.tokens?.idToken?.payload.name;
  const givenName = session.tokens?.idToken?.payload.given_name;
  const familyName = session.tokens?.idToken?.payload.family_name;

  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }

  const fullName = [givenName, familyName]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .trim();

  return fullName || null;
}

function createGravatarUrl(email: string | null) {
  if (!email) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const hash = createHash("md5").update(normalizedEmail).digest("hex");

  return `https://www.gravatar.com/avatar/${hash}?d=404&s=256`;
}

export async function getStaffSession(): Promise<StaffSession> {
  if (isE2ETestMode()) {
    return {
      avatarPreference: "initials",
      avatarUrl: null,
      displayName: "E2E Admin",
      email: "e2e-admin@example.com",
      gravatarUrl: null,
      groups: ["ADMINS", "OWNERS"],
      isAdmin: true,
      isAuthenticated: true,
      isOwner: true,
      uploadedAvatarUrl: null,
    };
  }

  try {
    return await runWithAuthServerContext(async (contextSpec) => {
      const session = await fetchAuthSession(contextSpec);
      const groups = readGroupsFromSession(session);
      const userAttributes = await fetchUserAttributes(contextSpec);
      const email =
        userAttributes.email ?? session.tokens?.idToken?.payload.email;
      const resolvedEmail = typeof email === "string" ? email : null;
      const displayName =
        userAttributes.name?.trim() || readDisplayNameFromSession(session);
      const uploadedAvatarUrl =
        userAttributes.picture?.trim() || userAttributes.profile?.trim() || null;
      const gravatarUrl = createGravatarUrl(resolvedEmail);
      const avatarUrl = resolveAvatarUrl({
        uploadedAvatarUrl,
        gravatarUrl,
      });
      const avatarPreference = uploadedAvatarUrl
        ? "uploaded"
        : avatarUrl
          ? "gravatar"
          : "initials";
      const isOwner =
        groups.includes("OWNERS") || userAttributes["custom:isOwner"] === "true";

      return {
        avatarPreference,
        avatarUrl,
        displayName,
        email: resolvedEmail,
        gravatarUrl,
        groups,
        isAdmin: groups.includes("ADMINS"),
        isAuthenticated: Boolean(session.tokens?.accessToken),
        isOwner,
        uploadedAvatarUrl,
      };
    });
  } catch {
    return {
      avatarPreference: "initials",
      avatarUrl: null,
      displayName: null,
      email: null,
      gravatarUrl: null,
      groups: [],
      isAdmin: false,
      isAuthenticated: false,
      isOwner: false,
      uploadedAvatarUrl: null,
    };
  }
}

export async function hasStaffUsers(): Promise<boolean> {
  if (isE2ETestMode()) {
    return true;
  }

  if (!authConfig?.user_pool_id || !authConfig?.aws_region) {
    return false;
  }

  try {
    const cognito = new CognitoIdentityProviderClient({
      region: authConfig.aws_region,
    });

    const result = await cognito.send(
      new ListUsersCommand({
        UserPoolId: authConfig.user_pool_id,
        Limit: 1,
      })
    );

    return (result.Users?.length ?? 0) > 0;
  } catch {
    // If we cannot verify the directory state, keep the bootstrap path visible so
    // first-run setup still works without a terminal detour.
    return false;
  }
}

async function createSessionCognitoClient() {
  if (!authConfig?.user_pool_id || !authConfig?.aws_region) {
    throw new Error("Cognito user pool configuration is unavailable.");
  }

  return runWithAuthServerContext(async (contextSpec) => {
    const session = await fetchAuthSession(contextSpec);

    if (!session.credentials) {
      throw new Error("No AWS credentials are available for the current session.");
    }

    return new CognitoIdentityProviderClient({
      credentials: session.credentials,
      region: authConfig.aws_region,
    });
  });
}

function readUserAttribute(
  attributes: { Name?: string; Value?: string }[] | undefined,
  key: string
) {
  return attributes?.find((attribute) => attribute.Name === key)?.Value ?? null;
}

export async function listStaffUsers(): Promise<StaffDirectoryUser[]> {
  if (!authConfig?.user_pool_id) {
    return [];
  }

  try {
    const cognito = await createSessionCognitoClient();
    const users: StaffDirectoryUser[] = [];
    let paginationToken: string | undefined;

    do {
      const result = await cognito.send(
        new ListUsersCommand({
          Limit: 60,
          PaginationToken: paginationToken,
          UserPoolId: authConfig.user_pool_id,
        })
      );

      for (const user of result.Users ?? []) {
        users.push({
          createdAt: user.UserCreateDate ?? null,
          displayName: readUserAttribute(user.Attributes, "name"),
          email: readUserAttribute(user.Attributes, "email"),
          enabled: user.Enabled ?? false,
          isOwner: readUserAttribute(user.Attributes, "custom:isOwner") === "true",
          status: user.UserStatus ?? null,
          username: user.Username ?? "",
        });
      }

      paginationToken = result.PaginationToken;
    } while (paginationToken);

    return users.sort((left, right) => {
      const leftEmail = left.email ?? left.username;
      const rightEmail = right.email ?? right.username;

      return leftEmail.localeCompare(rightEmail);
    });
  } catch (error) {
    console.error("[Auth] Unable to list staff users.", error);
    return [];
  }
}

export async function deleteStaffUser(username: string) {
  if (!authConfig?.user_pool_id) {
    throw new Error("Cognito user pool configuration is unavailable.");
  }

  const cognito = await createSessionCognitoClient();

  await cognito.send(
    new AdminDeleteUserCommand({
      UserPoolId: authConfig.user_pool_id,
      Username: username,
    })
  );
}

export async function updateStaffOwnerStatus({
  isOwner,
  username,
}: {
  isOwner: boolean;
  username: string;
}) {
  if (!authConfig?.user_pool_id) {
    throw new Error("Cognito user pool configuration is unavailable.");
  }

  const cognito = await createSessionCognitoClient();

  await cognito.send(
    new AdminUpdateUserAttributesCommand({
      UserAttributes: [
        {
          Name: "custom:isOwner",
          Value: isOwner ? "true" : "false",
        },
      ],
      UserPoolId: authConfig.user_pool_id,
      Username: username,
    })
  );
}
