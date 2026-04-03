import { cookies } from "next/headers";

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

type CookieStore = Awaited<ReturnType<typeof cookies>>;

type StaffSession = {
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

export async function getStaffSession(): Promise<StaffSession> {
  try {
    return await runWithAuthServerContext(async (contextSpec) => {
      const session = await fetchAuthSession(contextSpec);
      const groups = readGroupsFromSession(session);
      const email = session.tokens?.idToken?.payload.email;

      return {
        email: typeof email === "string" ? email : null,
        groups,
        isAdmin: groups.includes("ADMINS"),
        isAuthenticated: Boolean(session.tokens?.accessToken),
      };
    });
  } catch {
    return {
      email: null,
      groups: [],
      isAdmin: false,
      isAuthenticated: false,
    };
  }
}
