// app/api/animal-records/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getAnimalRecords,
  createAnimalRecord,
} from "@/services/animalRecordService";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const options = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
      sortBy: searchParams.get("sortBy") || "recordDate",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      recordType: searchParams.get("recordType") || undefined,
      batchId: searchParams.get("batchId")
        ? Number(searchParams.get("batchId"))
        : undefined,
      animalId: searchParams.get("animalId")
        ? Number(searchParams.get("animalId"))
        : undefined,
      healthStatus: searchParams.get("healthStatus") || undefined,
    };

    const result = await getAnimalRecords(auth.user, options);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch animal records" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await req.json();
    const record = await createAnimalRecord(auth.user, body);

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create record" },
      { status: 500 }
    );
  }
}
