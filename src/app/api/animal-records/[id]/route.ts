// app/api/animal-records/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getAnimalRecordById,
  updateAnimalRecord,
  deleteAnimalRecord,
} from "@/services/animalRecordService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const record = await getAnimalRecordById(auth.user, Number(params.id));
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: record }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch record" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await req.json();
    const updated = await updateAnimalRecord(auth.user, Number(params.id), body);

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update record" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    await deleteAnimalRecord(auth.user, Number(params.id));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete record" }, { status: 500 });
  }
}
