import { createHash } from "node:crypto";

import { cookies } from "next/headers";
import {
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
import { fetchAuthSession } from "aws-amplify/auth/server";
import { parseAmplifyConfig } from "aws-amplify/utils";

import outputs from "@/amplify_outputs.json";

const config = parseAmplifyConfig(outputs);
const authConfig = outputs.auth;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

type StaffSession = {
  avatarUrl: string | null;
  displayName: string | null;
  email: string | null;
  groups: string[];
  isAdmin: boolean;
  isAuthenticated: boolean;
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

  return `https://www.gravatar.com/avatar/${hash}?d=404&s=96`;
}

export async function getStaffSession(): Promise<StaffSession> {
  try {
    return await runWithAuthServerContext(async (contextSpec) => {
      const session = await fetchAuthSession(contextSpec);
      const groups = readGroupsFromSession(session);
      const email = session.tokens?.idToken?.payload.email;
      const resolvedEmail = typeof email === "string" ? email : null;
      const displayName = readDisplayNameFromSession(session);

      return {
        avatarUrl: createGravatarUrl(resolvedEmail),
        displayName,
        email: resolvedEmail,
        groups,
        isAdmin: groups.includes("ADMINS"),
        isAuthenticated: Boolean(session.tokens?.accessToken),
      };
    });
  } catch {
    return {
      avatarUrl: null,
      displayName: null,
      email: null,
      groups: [],
      isAdmin: false,
      isAuthenticated: false,
    };
  }
}

export async function hasStaffUsers(): Promise<boolean> {
  if (!authConfig?.user_pool_id || !authConfig?.aws_region) {
    return true;
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
    return true;
  }
}
