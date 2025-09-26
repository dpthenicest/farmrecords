import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAnimalRecords } from "@/services/animalRecordService";

export async function GET(req: Request, { params }: { params: { animalId: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const result = await getAnimalRecords(auth.user, { animalId: Number(params.animalId) });
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch animal records" }, { status: 500 });
  }
}
