import { NextResponse } from "next/server";

import {
  createMockRecord,
  deleteMockRecord,
  getMockRecord,
  listMockRecords,
  resetMockAdminDb,
  updateMockRecord,
} from "@/lib/e2e/admin-mock-store";
import { isE2ETestMode } from "@/lib/e2e/config";

export async function POST(request: Request) {
  if (!isE2ETestMode()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const body = (await request.json()) as {
    action: "reset" | "list" | "get" | "create" | "update" | "delete";
    model?: Parameters<typeof listMockRecords>[0];
    id?: string;
    params?: Record<string, unknown>;
    payload?: Record<string, unknown>;
  };

  try {
    switch (body.action) {
      case "reset":
        await resetMockAdminDb();
        return NextResponse.json({ data: true });
      case "list":
        return NextResponse.json({
          data: await listMockRecords(body.model!, body.params),
        });
      case "get":
        return NextResponse.json({
          data: await getMockRecord(body.model!, body.id ?? ""),
        });
      case "create":
        return NextResponse.json({
          data: await createMockRecord(body.model!, body.payload ?? {}),
        });
      case "update":
        return NextResponse.json({
          data: await updateMockRecord(body.model!, body.payload ?? {}),
        });
      case "delete":
        return NextResponse.json({
          data: await deleteMockRecord(body.model!, body.id ?? ""),
        });
    }
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        errors: [
          {
            message: error instanceof Error ? error.message : "Mock API failed.",
          },
        ],
      },
      { status: 500 }
    );
  }
}
